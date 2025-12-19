import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ClusteringOptions {
  data: Record<string, any>[]
  columnMapping: Record<string, string>
  numClusters?: number
  focusOn?: 'behavior' | 'demographics' | 'both'
}

export interface ClusterResult {
  id: string
  name: string
  size: number
  percentage: number
  behavioral_traits: Record<string, any>
  demographic_traits?: Record<string, any>
  reasoning: string
}

/**
 * Generate behavioral clusters using Claude
 */
export async function generateClusters(
  options: ClusteringOptions
): Promise<ClusterResult[]> {
  const { data, columnMapping, numClusters = 5, focusOn = 'behavior' } = options

  // Sample data if too large (use up to 1000 rows for clustering)
  const sampleData = data.length > 1000 ? data.slice(0, 1000) : data

  // Build prompt for Claude
  const prompt = buildClusteringPrompt(sampleData, columnMapping, numClusters, focusOn)

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  // Parse Claude's response
  const clusters = parseClusteringResponse(responseText, data.length)

  return clusters
}

/**
 * Build clustering prompt for Claude
 */
function buildClusteringPrompt(
  data: Record<string, any>[],
  columnMapping: Record<string, string>,
  numClusters: number,
  focusOn: 'behavior' | 'demographics' | 'both'
): string {
  const dataPreview = JSON.stringify(data.slice(0, 20), null, 2)
  const columns = Object.entries(columnMapping)
    .map(([col, type]) => `- ${col} (${type})`)
    .join('\n')

  return `You are a CRM data analyst specializing in customer segmentation. Analyze the following CRM data and create ${numClusters} distinct customer clusters.

**Column Mapping:**
${columns}

**Sample Data (first 20 rows):**
\`\`\`json
${dataPreview}
\`\`\`

**Total Rows:** ${data.length}

**Focus:** ${focusOn === 'behavior' ? 'Behavioral patterns (purchase frequency, recency, revenue)' : focusOn === 'demographics' ? 'Demographic characteristics (age, location, industry)' : 'Both behavioral and demographic patterns'}

**Instructions:**
1. Analyze the data to identify ${numClusters} distinct customer segments
2. Focus on ${focusOn} characteristics
3. For each cluster, provide:
   - A descriptive name (e.g., "High-Value Loyalists", "At-Risk Customers")
   - Key behavioral traits (purchase patterns, engagement, recency)
   - Demographic traits if available
   - Percentage of total customers (estimate based on sample)
   - Clear reasoning for the cluster definition

**Output Format:**
Return a JSON array with this exact structure:

\`\`\`json
[
  {
    "id": "cluster_1",
    "name": "Cluster Name",
    "percentage": 25,
    "behavioral_traits": {
      "purchase_frequency": "high|medium|low",
      "avg_revenue": "number or range",
      "recency": "recent|moderate|inactive",
      "engagement_level": "high|medium|low"
    },
    "demographic_traits": {
      "primary_industry": "industry name or null",
      "typical_company_size": "size or null",
      "geographic_region": "region or null"
    },
    "reasoning": "Brief explanation of what defines this cluster"
  }
]
\`\`\`

Return ONLY the JSON array, no additional text.`
}

/**
 * Parse Claude's clustering response
 */
function parseClusteringResponse(response: string, totalRows: number): ClusterResult[] {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const clusters = JSON.parse(jsonText) as any[]

    // Calculate actual sizes based on percentages
    return clusters.map((cluster, index) => ({
      id: cluster.id || `cluster_${index + 1}`,
      name: cluster.name,
      size: Math.round((cluster.percentage / 100) * totalRows),
      percentage: cluster.percentage,
      behavioral_traits: cluster.behavioral_traits || {},
      demographic_traits: cluster.demographic_traits || {},
      reasoning: cluster.reasoning || '',
    }))
  } catch (error) {
    console.error('Failed to parse clustering response:', error)
    throw new Error('Failed to parse AI clustering results')
  }
}

/**
 * Refine clusters based on user feedback
 */
export async function refineClusters(
  currentClusters: ClusterResult[],
  action: 'merge' | 'split' | 'rename',
  params: any
): Promise<ClusterResult[]> {
  const prompt = buildRefinementPrompt(currentClusters, action, params)

  const message = await anthropic.messages.create({
    model: 'claude-3-haiku-20240307',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseClusteringResponse(responseText, currentClusters.reduce((sum, c) => sum + c.size, 0))
}

function buildRefinementPrompt(
  clusters: ClusterResult[],
  action: string,
  params: any
): string {
  const currentClustersJson = JSON.stringify(clusters, null, 2)

  return `You are refining customer clusters. Current clusters:

\`\`\`json
${currentClustersJson}
\`\`\`

**Action:** ${action}
**Parameters:** ${JSON.stringify(params, null, 2)}

Based on this action, update the clusters and return the refined cluster array in the same JSON format.
Return ONLY the JSON array, no additional text.`
}
