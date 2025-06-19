import { defineConfig } from '@pandacss/dev';
import { createPreset } from '@park-ui/panda-preset';
import { theme } from './src/theme';
import pink from '@park-ui/panda-preset/colors/pink';
import mauve from '@park-ui/panda-preset/colors/mauve';

const config = defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: [
    '@pandacss/preset-base',
    createPreset({
      accentColor: pink,
      grayColor: mauve,
      radius: 'lg'
    })
  ],

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx,astro}'],

  // Files to exclude
  exclude: [],

  staticCss: {
    recipes: {
      // text: ['*']
    },
    css: [
      {
        properties: {
          listStyleType: ['none', 'disc', 'decimal'],
          fontWeight: ['bold'],
          fontSize: ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']
        }
      },
      {
        properties: {
          backgroundColor: [
            'difficulty.normal.bg',
            'difficulty.hard.bg',
            'difficulty.expert.bg',
            'difficulty.master.bg'
          ],
          color: [
            'difficulty.normal.fg',
            'difficulty.hard.fg',
            'difficulty.expert.fg',
            'difficulty.master.fg'
          ],
          borderColor: [
            'difficulty.normal.fg',
            'difficulty.normal.bg',
            'difficulty.hard.fg',
            'difficulty.hard.bg',
            'difficulty.expert.fg',
            'difficulty.expert.bg',
            'difficulty.master.fg',
            'difficulty.master.bg'
          ]
        },
        conditions: ['light', 'dark', '_checked']
      }
    ]
  },
  // Useful for theme customization
  theme: {
    extend: theme
  },

  jsxFramework: 'react',

  // The output directory for your css system
  outdir: './styled-system',

  importMap: {
    css: 'styled-system/css',
    recipes: 'styled-system/recipes',
    patterns: 'styled-system/patterns',
    jsx: 'styled-system/jsx'
  },

  conditions: {
    extend: {
      dark: ['&.dark, .dark &'],
      light: ['&.light, .light &']
    }
  },

  lightningcss: true
});

export default config;
