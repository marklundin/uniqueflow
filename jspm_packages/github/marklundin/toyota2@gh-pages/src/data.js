export default {
  assets:{
    sounds:[
      "sounds/Drone_02.mp3",
      "sounds/Day_01.mp3",
      "sounds/Day_02.mp3",
      "sounds/Day_03.mp3",
      "sounds/Day_04.mp3",
      "sounds/Day_05.mp3",
      "sounds/Day_06.mp3",
      "sounds/Night_01.mp3",
      "sounds/Night_02.mp3",
      "sounds/Night_03.mp3",
      "sounds/Night_04.mp3",
      "sounds/Night_05.mp3",
      "sounds/Night_06.mp3",
    ]
  },
  scenes: {
    "default": {
      background: {
        main: 0x000000,
        assets: [0x202020],
        detail: {
          colors: [0x313131],
          opacities: [1],
          scale: [ 10, 10 ],
          numberRatio: .2
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0x9e9292,
          crossTip: true,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: .4
        }
      ]
    },
    "front-bumper": {
      sound: "Day_02",

      background: {
        main: 0xc7c1c1,
        assets: [0x7b7d80, 0xbdb7b7],
        detail: {
          colors: [0xffa770],
          opacities: [1],
          scale: [ 10, .3 ],
          numberRatio: 1
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xffd400,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [1, -2, 2],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0x565656,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 2, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0x8c8c8c,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-0, -0, 100],
          radius: .1
        },
        {
          tipColor: 0xFFFFFF,
          color: 0xFFFFFF,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-200, -0, 0],
          radius: .2
        },
      ]
    },
    "rear-bumper": {
      sound: "Day_01",
      tunnel: {
        color: 0xfffada
      },
      background: {
        main: 0xf2f1ee,
        assets: [ 0xd3c5c1, 0x6e695f],
        detail: {
          colors: [0xfffada],
          opacities: [1],
          scale: [ 15, 15 ],
          numberRatio: .1
        }
      },
      lines: [
        {
          tipColor: 0xfffbe1,
          color: 0xf4f1dc,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: .4
        },
        {
          tipColor: 0xfffbe1,
          color: 0xf4f1dc,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [1, -1, -1],
          radius: 1
        },
        {
          tipColor: 0xfffbe1,
          color: 0xf6f4ef,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-1, 1, -2],
          radius: 1
        },
        {
          tipColor: 0xfffbe1,
          color: 0xf4f1dc,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-20, 20, 0],
          radius: .1
        }
      ]
    },
    "headlight-front": {
      sound: "Night_01",
      tunnel: {
        color: 0xa898ef
      },
      background: {
        main: 0x210044,
        assets: [0x2c0024, 0x2b0128, 0x210044, 0x000000],
        detail: {
          colors: [0xa898ef, 0xc598ef, 0xdc98ef,0xef98e0, 0xef98c4],
          opacities: [.6, .25, .33, .1],
          scale: [ 2, 2 ],
          numberRatio: 1
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xa898ef,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xc598ef,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [10, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xdc98ef,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 60, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xef98e0,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [-10, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xef98c4,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [-0, 0, 0],
          radius: .3
        }
      ]
    },
    "mirror": {
      sound: "Night_02",
      tunnel: {
        color: 0xffd2f1
      },
      background: {
        main: 0x7500ff,
        assets: [ 0xff4ea8, 0x7500ff],
        detail: {
          colors: [0xcb72df],
          opacities: [.6],
          scale: [ 30, 20 ],
          numberRatio: .4
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xffd2f1,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-10, 10, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0xffd2f1,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0xffd2f1,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [10, -10, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0xffd2f1,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-10, -20, 0],
          radius: 1
        }
      ]
    },
    "chassis": {
      sound: "Night_03",
        tunnel: {
        color: 0x000e79
      },
      background: {
        main: 0x090018,
        assets: [ 0x410337, 0x000e79],
        detail: {
          colors: [0x1f0033],
          opacities: [1],
          scale: [ 10, 10 ],
          numberRatio: 0
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [6, -1, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [12, -5, 0],
          radius: .1
        },
       {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-12, -5, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: .1
        },
                {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [-6, -1, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xffecff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: .1
        }
      ]
    },
    "door": {
      sound: "Day_03",
        tunnel: {
        color: 0xa39e9d
      },
      background: {
        main: 0xd6d6d6,
        assets: [ 0xfffbed, 0xf4f2ec],
        detail: {
          colors: [0xa39e9d],
          opacities: [.2],
          scale: [ 15, 15 ],
          numberRatio: .3
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xf7ece6,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: 2
        },
        {
          tipColor: 0xffc4be,
          color: 0xff4835,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [-2, 2, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0xddc8c4,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xe8e5e5,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: .1
        }
      ]
    },
    "roof": {
      sound: "Day_04",
        tunnel: {
        color: 0x101010
      },
      background: {
        main: 0xffffff,
        assets: [ 0xf4f2ec, 0xededed],
        detail: {
          colors: [0xffffff],
          opacities: [1],
          scale: [ 10, 10 ],
          numberRatio: 0
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xefece2,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 1.5
        },
        {
          tipColor: 0xffffff,
          color: 0xffffff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [1, -1, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0xfff9e7,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [8, -15, 0],
          radius: .2
        },
        {
          tipColor: 0xffffff,
          color: 0xc6c6c6,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [10, -25, 0],
          radius: .2
        }
      ]
    },
    "headlight-rear": {
      sound: "Night_04",
        tunnel: {
        color: 0xffffff
      },

      background: {
        main: 0x000760,
        assets: [ 0x000000, 0x000000],
        detail: {
          colors: [0x000874],
          opacities: [1],
          scale: [ 50, 50 ],
          numberRatio: .5
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0xc0c0c0,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: .8
        },
        {
          tipColor: 0xffffff,
          color: 0xc0c0c0,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [4, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xc0c0c0,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [200, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xc0c0c0,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [-1000, 0, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0xc0c0c0,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [-200, 0, 0],
          radius: .1
        }
      ]
    },
    "gearshift": {
      sound: "Day_05",
        tunnel: {
        color: 0xede8e0
      },
      background: {
        main: 0xf4f0e7,
        assets: [ 0xddd5c9, 0xe3ddcc],
        detail: {
          colors: [0xede8e0],
          opacities: [1],
          scale: [ 20, 3 ],
          numberRatio: .3
        }
      },
      lines: [
        {
          tipColor: 0xccd1ff,
          color: 0x0014a8,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [3, 2, 0],
          radius: .5
        },
        {
          tipColor: 0xf4f0e7,
          color: 0xffffff,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: 1
        },
        {
          tipColor: 0xf4f0e7,
          color: 0x000000,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [2, -1, 0],
          radius: .1
        },
        {
          tipColor: 0xf4f0e7,
          color: 0x000000,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [2, 1, 0],
          radius: .1
        },
        {
          tipColor: 0xf4f0e7,
          color: 0x000000,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        },
        {
          tipColor: 0xf4f0e7,
          color: 0x000000,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        }
      ]
    },
    "suspension": {
      sound: "Day_06",
        tunnel: {
        color: 0x004539
      },

      background: {
        main: 0x000000,
        assets: [ 0x00062e, 0x006254],
        detail: {
          colors: [0x004539],
          opacities: [1, .5, .2],
          scale: [ 20, 12 ],
          numberRatio: .4
        }
      },
      lines: [
        {
          tipColor: 0xffffff,
          color: 0x00fff6,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [3, 2, 0],
          radius: .5
        },
        {
          tipColor: 0xffffff,
          color: 0x000000,
          crossTip: false,
          style: "square",
          shading: true,
          offset: [0, 0, 0],
          radius: 1
        },
        {
          tipColor: 0xffffff,
          color: 0x0050fe,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [2, -1, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0x0050fe,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [2, 1, 0],
          radius: .1
        },
        {
          tipColor: 0xffffff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        },
        {
          tipColor: 0xffffff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        }
      ]
    },
    "wheel": {
      sound: "Night_05",
      tunnel: {
        color: 0xece4e2
      },

      background: {
        main: 0xeae2ce,
        assets: [ 0x70c6a3, 0xf9b7b9],
        detail: {
          colors: [0xece4e2],
          opacities: [1],
          scale: [ 15, 8 ],
          numberRatio: .6
        }
      },
      lines: [
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 1
        },
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [60, 0, 0],
          radius: 0.2
        },
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0.0
        },
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0.0
        },
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        },
        {
          tipColor: 0x9691ff,
          color: 0x5a53a3,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        }
      ]
    },
    "logo": {
      sound: "Night_06",
             tunnel: {
        color: 0x006865
      },

      background: {
        main: 0x00111a,
        assets: [ 0x000d5e, 0x006865],
        detail: {
          colors: [0x000d5e],
          opacities: [.8],
          scale: [ 6, 3 ],
          numberRatio: .7
        }
      },
      lines: [
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 1
        },
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [6, 6, 0],
          radius: .2
        },
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [9, -4, 0],
          radius: .1
        },
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [11, 3, 0],
          radius: .1
        },
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        },
        {
          tipColor: 0xffccc5,
          color: 0xff0048,
          crossTip: false,
          style: "square",
          shading: false,
          offset: [0, 0, 0],
          radius: 0
        }
      ]
    }
  }
};
