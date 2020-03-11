;( _ => {
  const KEY_LEN = 32
  const BLOCK_SIZE = 16

  function get_random_int(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function key_valid (text) {
    if (!text) {
      return 'Required'
    }

    // key length must be 128 bits
    if (text.length !== KEY_LEN) {
      return 'Format Error'
    }
    for (let i of text) {
      if (i > 'F' || i < 'A') {
        let n = parseInt(i)
        if (isNaN(i) || n < 0 || n > 9) {
          return 'Format Error'
        }
      }
    }
    return true
  }

  function decrypt(cipherText, key) {
    cipherText = aesjs.utils.hex.toBytes(cipherText)
    key = aesjs.utils.hex.toBytes(key)
    let aes = new aesjs.AES(key)
    return aes.decrypt(cipherText)
  }

  Vue.component('decrypt-box', {
    template: `
      <div class="decrypt-container">
        <v-text-field
          class="decrypt-cipher"
          color="blue darken-2"
          :label="cipherLabel"
          :rules="rule"
          v-model="cipher"
          clearable
          @input="get_result"
        ></v-text-field>
        <v-text-field
          class="decrypt-key"
          color="blue darken-2"
          :label="keyLabel"
          :rules="rule"
          v-model="key"
          clearable
          @input="get_result"
        ></v-text-field>
        <span class="result-span">所选数是：{{ n }}</span>
      </div>
    `,
    props: {
      pos: Number,
    },
    data () {
      return {
        rule: [
          key_valid
        ],
        n: '?',
        cipher: "",
        key: ""
      }
    },
    computed: {
      cipherLabel () {
        return "密文" + this.pos
      },
      keyLabel () {
        return "密钥" + this.pos
      }
    },
    methods: {
      get_result () {
        if (key_valid(this.cipher) === true && key_valid(this.key) === true) {
          let plainText = decrypt(this.cipher, this.key)
          for (let i = 0; i < BLOCK_SIZE - 1; ++i) {
            if (plainText[i] !== 0) {
              this.set_n('?')
              return
            }
          }
          if (plainText[BLOCK_SIZE - 1] < 0 || plainText[BLOCK_SIZE - 1] >= 6) {
            this.set_n('?')
            return
          }
          this.set_n(plainText[BLOCK_SIZE - 1])
        } else {
          this.set_n('?')
        }
      },
      get_value () {
        return this.n
      },
      set_n (val) {
        if (this.n !== val) {
          this.n = val
          this.$emit('result_change', this.pos, val)
        }
      }
    }
  })

  new Vue({
    el: '#app',
    vuetify: new Vuetify(),
    data: {
      n: '',
      nRule: [
        value => !!value || 'Required'
      ],
      key: '',
      keyRule: [
        key_valid
      ],
      cipherText: '',
      ciphers: ["", "", ""],
      keys: ["", "", ""],
      results: ['?', '?', '?'],
      a: [0, 1, 2],
      headers: [
        {
          text: 'Result',
          sortable: false,
          value: 'result',
        },
        {
          text: '宿舍一',
          sortable: false,
          value: 'first'
        },
        {
          text: '宿舍二',
          sortable: false,
          value: 'second'
        },
        {
          text: '宿舍三',
          sortable: false,
          value: 'third'
        }
      ],
      desserts: [
        {
          result: 0,
          first: 'xx2',
          second: 'xx4',
          third: 'xx5'
        },
        {
          result: 1,
          first: 'xx2',
          second: 'xx5',
          third: 'xx4'
        },
        {
          result: 2,
          first: 'xx4',
          second: 'xx2',
          third: 'xx5'
        },
        {
          result: 3,
          first: 'xx4',
          second: 'xx5',
          third: 'xx2'
        },
        {
          result: 4,
          first: 'xx5',
          second: 'xx2',
          third: 'xx4'
        },
        {
          result: 5,
          first: 'xx5',
          second: 'xx4',
          third: 'xx2'
        },
      ],
    },
    computed: {
      sum () {
        for (let i of this.results) {
          if (i === '?') {
            return '?'
          }
        }
        return this.results.reduce((a, b) => a + b) % 6
      }
    },
    methods: {
      nGen () {
        this.n = String(get_random_int(0, 5))
      },
      keyGen () {
        this.key = ''
        for (let i = 0; i < KEY_LEN; ++i) {
          let newNum = get_random_int(0, 15)
          if (newNum <= 9) {
            this.key += newNum
          } else {
            this.key += String.fromCharCode(newNum - 10 + 'A'.charCodeAt(0))
          }
        }
      },
      encrypt () {
        let key = aesjs.utils.hex.toBytes(this.key)

        let plainText = []
        for (let i = 0; i < BLOCK_SIZE - 1; ++i) {
          plainText = plainText.concat(0)
        }
        plainText = plainText.concat(parseInt(this.n))
        
        let aes = new aesjs.AES(key)
        let cipherText = aes.encrypt(plainText)
        this.cipherText = aesjs.utils.hex.fromBytes(cipherText).toUpperCase()
      },
      change_result (pos, val) {
        this.$set(this.results, pos, val)
      },
      getColor (calories) {
        if (calories > 400) return 'none'
        else if (calories > 200) return 'orange'
        else return 'green'
      }
    }
  })
})()
