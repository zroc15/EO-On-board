import axios from 'axios';
import pool from '../db/pool';

class TeamworkService {
  private apiKey: string;
  private domain: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TEAMWORK_API_KEY || '';
    this.domain = process.env.TEAMWORK_DOMAIN || '';
    this.baseUrl = `https://${this.domain}/projects/api/v3`;

    if (!this.apiKey || !this.domain) {
      console.warn('Teamwork credentials not configured. Integration will be disabled.');
    }
  }

  private getAuthHeader() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async createProject(onboardingId: string): Promise<string> {
    if (!this.apiKey || !this.domain) {
      throw new Error('Teamwork integration not configured');
    }

    try {
      // Get onboarding data
      const recordResult = await pool.query(
        `SELECT ob.*, s.*, cs.products_sold
         FROM onboarding_records ob
         JOIN stakeholders s ON ob.id = s.onboarding_id
         JOIN commercial_scope cs ON ob.id = cs.onboarding_id
         WHERE ob.id = $1`,
        [onboardingId]
      );

      if (recordResult.rows.length === 0) {
        throw new Error('Onboarding record not found');
      }

      const record = recordResult.rows[0];
      const products = JSON.parse(record.products_sold || '[]');

      // Create project in Teamwork
      const projectData = {
        project: {
          name: `${record.customer_name} - Deployment`,
          description: `Customer onboarding for ${record.customer_name}`,
          startDate: new Date().toISOString().split('T')[0],
          category: 'deployment',
          tags: products,
          customFields: {
            salesforceOpportunityId: record.salesforce_opportunity_id,
            complexityLevel: record.complexity_level,
            onboardingRecordId: onboardingId
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/projects.json`,
        projectData,
        { headers: this.getAuthHeader() }
      );

      const projectId = response.data.project.id;

      // Create default milestones based on products
      await this.createMilestones(projectId, products);

      return projectId;
    } catch (error) {
      console.error('Error creating Teamwork project:', error);
      throw error;
    }
  }

  private async createMilestones(projectId: string, products: string[]) {
    const milestones: Record<string, string[]> = {
      'ZIA Deployment': ['ZIA Discovery', 'ZIA Configuration', 'ZIA Testing', 'ZIA Go-Live'],
      'ZPA Deployment': ['ZPA Discovery', 'ZPA Configuration', 'ZPA Testing', 'ZPA Go-Live'],
      'DLP': ['DLP Policy Design', 'DLP Configuration', 'DLP Testing'],
      'ZTB': ['ZTB Planning', 'ZTB Deployment', 'ZTB Validation']
    };

    const milestonesToCreate: string[] = [];

    products.forEach(product => {
      if (milestones[product]) {
        milestonesToCreate.push(...milestones[product]);
      }
    });

    // Add common milestones
    milestonesToCreate.unshift('Kickoff');
    milestonesToCreate.push('Documentation & Handoff');

    for (let i = 0; i < milestonesToCreate.length; i++) {
      const milestone = milestonesToCreate[i];

      try {
        await axios.post(
          `${this.baseUrl}/projects/${projectId}/milestones.json`,
          {
            milestone: {
              name: milestone,
              description: `${milestone} phase`,
              responsiblePartyId: null
            }
          },
          { headers: this.getAuthHeader() }
        );
      } catch (error) {
        console.error(`Failed to create milestone ${milestone}:`, error);
      }
    }
  }

  async updateProjectStatus(projectId: string, status: string) {
    if (!this.apiKey || !this.domain) {
      return;
    }

    try {
      await axios.put(
        `${this.baseUrl}/projects/${projectId}.json`,
        {
          project: {
            status: status
          }
        },
        { headers: this.getAuthHeader() }
      );
    } catch (error) {
      console.error('Error updating Teamwork project status:', error);
    }
  }

  async assignEngineerToProject(projectId: string, engineerEmail: string) {
    if (!this.apiKey || !this.domain) {
      return;
    }

    try {
      // First, find the user ID by email (this depends on Teamwork's people API)
      const peopleResponse = await axios.get(
        `${this.baseUrl}/people.json`,
        { headers: this.getAuthHeader() }
      );

      const person = peopleResponse.data.people.find(
        (p: any) => p.emailAddress === engineerEmail
      );

      if (!person) {
        console.warn(`Engineer ${engineerEmail} not found in Teamwork`);
        return;
      }

      // Add person to project
      await axios.put(
        `${this.baseUrl}/projects/${projectId}/people/${person.id}.json`,
        {},
        { headers: this.getAuthHeader() }
      );
    } catch (error) {
      console.error('Error assigning engineer to Teamwork project:', error);
    }
  }
}

export default TeamworkService;
