var app = new Vue({
  data: {
    COLS: ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P'],
    isdwarfturn: true,
    thudboard: [
        ['#','#','#','#','#','d','d',' ','d','d','#','#','#','#','#'],
        ['#','#','#','#','d',' ',' ',' ',' ',' ','d','#','#','#','#'],
        ['#','#','#','d',' ',' ',' ',' ',' ',' ',' ','d','#','#','#'],
        ['#','#','d',' ',' ',' ',' ',' ',' ',' ',' ',' ','d','#','#'],
        ['#','d',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','d','#'],
        ['d',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','d'],
        ['d',' ',' ',' ',' ',' ','T','T','T',' ',' ',' ',' ',' ','d'],
        [' ',' ',' ',' ',' ',' ','T','X','T',' ',' ',' ',' ',' ',' '],
        ['d',' ',' ',' ',' ',' ','T','T','T',' ',' ',' ',' ',' ','d'],
        ['d',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','d'],
        ['#','d',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','d','#'],
        ['#','#','d',' ',' ',' ',' ',' ',' ',' ',' ',' ','d','#','#'],
        ['#','#','#','d',' ',' ',' ',' ',' ',' ',' ','d','#','#','#'],
        ['#','#','#','#','d',' ',' ',' ',' ',' ','d','#','#','#','#'],
        ['#','#','#','#','#','d','d',' ','d','d','#','#','#','#','#']],
    legalmoveto: Array(15).fill(0).map(x=>Array(15).fill(false)),
    legalattack: Array(15).fill(0).map(x=>Array(15).fill(false)),
    selectpiece: true,
    selectdest: false,
    selectattack: false,
    movefrom: [-1,-1],
  },
  methods: {
    selectable: function (x,y) {
      if (this.selectpiece) {
        return (this.isdwarfturn && this.thudboard[y][x] == 'd'
                || ! this.isdwarfturn && this.thudboard[y][x] == 'T');
      }
      else if (this.selectdest) return this.legalmoveto[y][x];
      else return false;
    },
    selected: function (x,y) {
      if (this.selectpiece) return false;
      else if (this.selectdest) return this.movefrom[0] == x && this.movefrom[1] == y;
      else return false;
    },
    isattack: function (x,y) {
      if (this.selectpiece) return false;
      else if (this.selectdest) return this.legalattack[y][x];
      else return false;
    },
  },
});
