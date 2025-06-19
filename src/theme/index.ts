import { type PartialTheme } from '@pandacss/types';

export const theme: PartialTheme = {
  layerStyles: {
    textStroke: {
      value: {
        //@ts-expect-error TODO: incompatible type
        WebkitTextStrokeWidth: '0.23',
        //@ts-expect-error TODO: incompatible type
        WebkitTextStrokeColor: '{colors.fg.default}'
      }
    }
  },
  tokens: {
    colors: {
      ll: {
        1: { value: '#170e11' },
        2: { value: '#211217' },
        3: { value: '#3c1223' },
        4: { value: '#53082c' },
        5: { value: '#620f36' },
        6: { value: '#731d43' },
        7: { value: '#8e2c56' },
        8: { value: '#b7386f' },
        9: { value: '#e4007f' },
        10: { value: '#d40072' },
        11: { value: '#ff87b8' },
        12: { value: '#ffd0e0' },
        a1: { value: '#ec001207' },
        a2: { value: '#f4206612' },
        a3: { value: '#fb17732f' },
        a4: { value: '#ff007247' },
        a5: { value: '#ff0c7e57' },
        a6: { value: '#ff2f8b69' },
        a7: { value: '#ff459586' },
        a8: { value: '#ff4998b2' },
        a9: { value: '#fe008ce3' },
        a10: { value: '#ff0088d1' },
        a11: { value: '#ff87b8' },
        a12: { value: '#ffd0e0' }
      },
      accent: {
        1: { value: '{colors.ll.1}' },
        2: { value: '{colors.ll.2}' },
        3: { value: '{colors.ll.3}' },
        4: { value: '{colors.ll.4}' },
        5: { value: '{colors.ll.5}' },
        6: { value: '{colors.ll.6}' },
        7: { value: '{colors.ll.7}' },
        8: { value: '{colors.ll.8}' },
        9: { value: '{colors.ll.9}' },
        10: { value: '{colors.ll.10}' },
        11: { value: '{colors.ll.11}' },
        12: { value: '{colors.ll.12}' },
        a1: { value: '{colors.ll.a1}' },
        a2: { value: '{colors.ll.a2}' },
        a3: { value: '{colors.ll.a3}' },
        a4: { value: '{colors.ll.a4}' },
        a5: { value: '{colors.ll.a5}' },
        a6: { value: '{colors.ll.a6}' },
        a7: { value: '{colors.ll.a7}' },
        a8: { value: '{colors.ll.a8}' },
        a9: { value: '{colors.ll.a9}' },
        a10: { value: '{colors.ll.a10}' },
        a11: { value: '{colors.ll.a11}' },
        a12: { value: '{colors.ll.a12}' },
        default: {
          value: '{colors.ll.9}'
        },
        emphasized: {
          value: '{colors.ll.10}'
        },
        fg: {
          value: '{colors.white}'
        },
        text: {
          value: '{colors.ll.a11}'
        }
      },
      'difficulty-normal': {
        default: { value: '#6cd2dd' }, // rgb(108,210,221)
        dark: { value: '#4eb4bf' } // rgb(78, 180, 191)
      },
      'difficulty-hard': {
        default: { value: '#f3b44d' }, // rgb(243,180,77)
        dark: { value: '#d5962f' } // rgb(213, 150, 47)
      },
      'difficulty-expert': {
        default: { value: '#ea668f' }, // rgb(234,102,143)
        dark: { value: '#cc4871' } // rgb(204, 72, 113)
      },
      'difficulty-master': {
        default: { value: '#8b71cd' }, // rgb(139,113,205)
        dark: { value: '#6d53af' } // rgb(109, 83, 175)
      }
    }
  },
  semanticTokens: {
    colors: {
      difficulty: {
        normal: {
          bg: {
            value: {
              base: '{colors.difficulty-normal.default}',
              _dark: '{colors.difficulty-normal.dark}'
            }
          },
          fg: { value: '{colors.difficulty-normal.default}' }
        },
        hard: {
          bg: {
            value: {
              base: '{colors.difficulty-hard.default}',
              _dark: '{colors.difficulty-hard.dark}'
            }
          },
          fg: { value: '{colors.difficulty-hard.default}' }
        },
        expert: {
          bg: {
            value: {
              base: '{colors.difficulty-expert.default}',
              _dark: '{colors.difficulty-expert.dark}'
            }
          },
          fg: { value: '{colors.difficulty-expert.default}' }
        },
        master: {
          bg: {
            value: {
              base: '{colors.difficulty-master.default}',
              _dark: '{colors.difficulty-master.dark}'
            }
          },
          fg: { value: '{colors.difficulty-master.default}' }
        }
      },
      accent: {
        // ... existing accent tokens
        1: { value: '{colors.ll.1}' },
        2: { value: '{colors.ll.2}' },
        3: { value: '{colors.ll.3}' },
        4: { value: '{colors.ll.4}' },
        5: { value: '{colors.ll.5}' },
        6: { value: '{colors.ll.6}' },
        7: { value: '{colors.ll.7}' },
        8: { value: '{colors.ll.8}' },
        9: { value: '{colors.ll.9}' },
        10: { value: '{colors.ll.10}' },
        11: { value: '{colors.ll.11}' },
        12: { value: '{colors.ll.12}' },
        a1: { value: '{colors.ll.a1}' },
        a2: { value: '{colors.ll.a2}' },
        a3: { value: '{colors.ll.a3}' },
        a4: { value: '{colors.ll.a4}' },
        a5: { value: '{colors.ll.a5}' },
        a6: { value: '{colors.ll.a6}' },
        a7: { value: '{colors.ll.a7}' },
        a8: { value: '{colors.ll.a8}' },
        a9: { value: '{colors.ll.a9}' },
        a10: { value: '{colors.ll.a10}' },
        a11: { value: '{colors.ll.a11}' },
        a12: { value: '{colors.ll.a12}' },
        default: {
          value: '{colors.ll.9}'
        },
        emphasized: {
          value: '{colors.ll.10}'
        },
        fg: {
          value: '{colors.white}'
        },
        text: {
          value: '{colors.ll.a11}'
        }
      }
    }
  },
  keyframes: {},
  recipes: {
    formLabel: {
      base: {
        fontWeight: 'bold'
      }
    }
  }
};
