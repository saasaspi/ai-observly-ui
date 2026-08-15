import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { table } from 'sanity-plugin-table'
import { schemas } from './schemas'

export default defineConfig({
  name: 'ai-observly-studio',
  title: 'AI Observly',

  projectId: 'y4ebxpas',
  dataset: 'production',

  plugins: [structureTool(), table()],

  schema: {
    types: schemas,
  },
})
