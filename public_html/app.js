var dirs = [
  {dx:1,dy:0},
  {dx:1,dy:1},
  {dx:0,dy:1},
  {dx:-1,dy:1},
  {dx:-1,dy:0},
  {dx:-1,dy:-1},
  {dx:0,dy:-1},
  {dx:1,dy:-1},
];

var SIZE = 15;

function inbounds(pos) {
  return (0 <= pos.x && pos.x < SIZE
          && 0 <= pos.y && pos.y < SIZE);
}

function coord(x,y) {
  return {x:x,y:y};
}

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
    movefrom: {x:-1,y:-1},
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
      else if (this.selectdest) return this.movefrom.x == x
                                       && this.movefrom.y == y;
      else return false;
    },
    isattack: function (x,y) {
      if (this.selectpiece) return false;
      else if (this.selectdest) return this.legalattack[y][x];
      else return false;
    },
    click: function (x,y) {
      if (this.selectpiece) {
        if (this.isdwarfturn && this.thudboard[y][x] == 'd'
            || ! this.isdwarfturn && this.thudboard[y][x] == 'T') {
          this.movefrom = {x:x,y:y};
          this.setlegalmoveto();
          this.setlegalattack();

          this.selectpiece = false;
          this.selectdest = true;
          this.selectattack = false;

          return;
        }
      }
      else if (this.selectdest) {
        if (this.legalmoveto[y][x]) {
          var piece = this.thudboard[this.movefrom.y][this.movefrom.x];
          Vue.set(this.thudboard[this.movefrom.y], this.movefrom.x, ' ');
          Vue.set(this.thudboard[y], x, piece);
          this.isdwarfturn = ! this.isdwarfturn;
          // fall through to clear state
        }
      }

      // cancel move: clear state
      this.movefrom = {x:-1,y:-1};
      this.selectpiece = true;
      this.selectdest = false;
      this.selectattack = false;
      this.legalmoveto = Array(15).fill(0).map(x=>Array(15).fill(false));
      this.legalattack = Array(15).fill(0).map(x=>Array(15).fill(false));
    },
    setlegalmoveto : function() {
      if (this.isdwarfturn) {
        for (var ix=0 ; ix<dirs.length ; ix+=1) {
          for (var dist=1 ; dist<SIZE ; dist+=1) {
            var dest = coord(this.movefrom.x + dirs[ix].dx*dist,
                             this.movefrom.y + dirs[ix].dy*dist);
            console.log(dest);
            if (inbounds(dest)) {
              if (this.thudboard[dest.y][dest.x] == ' ') {
                Vue.set(this.legalmoveto[dest.y], dest.x, true);
              }
              else break;
            }
            else break;
          }
        }
      }
      else {
        for (var ix=0 ; ix<dirs.length ; ix+=1) {
          var dest = coord(this.movefrom.x + dirs[ix].dx,
                           this.movefrom.y + dirs[ix].dy);
          if (inbounds(dest)) {
            if (this.thudboard[dest.y][dest.x] == ' ') {
              Vue.set(this.legalmoveto[dest.y], dest.x, true);
            }
          }
        }
      }
    },
    setlegalattack : function() {
    },
  },
});
