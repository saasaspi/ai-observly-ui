import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemas } from './schemas'

export default defineConfig({
  name: 'ai-observly-studio',
  title: 'AI Observly',

  projectId: 'y4ebxpas',
  dataset: 'production',

  plugins: [structureTool()],

  schema: {
    types: schemas,
  },
})
