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

function showcoord(pos) {
  return showpos(pos.x,pos.y);
}

function showpos(x,y) {
  return app.COLS[x] + (y+1); //XXX using app is an ugly hack :-\
}

function parsecoord(raw_pos) {
  var x = app.COLS.indexOf(raw_pos.charAt(0));
  if (x == -1) return [null, raw_pos];
  var raw_y = parseInt(raw_pos.slice(1));
  if (isNaN(raw_y)) return [null, raw_pos];
  var y = raw_y-1;
  var newcoord = coord(x,y);
  return [newcoord, raw_pos.slice(1+(""+y).length)];
}

function parsemove(raw_move) {
  raw_move = raw_move.replace(/\s+/g, '');
  raw_move = raw_move.toUpperCase();

  var move = {};
  if (raw_move.charAt(0) == 'D') move.isdwarfmove = true;
  else if (raw_move.charAt(0) == "T") move.isdwarfmove = false;
  else return null;

  var [from,raw_dest] = parsecoord(raw_move.slice(1));
  if (from === null) return null;
  move.from = from;

  if (raw_dest.charAt(0) != '-') return null;

  var [to,raw_attacks] = parsecoord(raw_dest.slice(1));
  if (to === null) return null;
  move.to = to;

  move.attacks = [];
  while (raw_attacks.length != 0) {
    if (raw_attacks.charAt(0) != 'X') return null;
    var [attack,raw_attacks] = parsecoord(raw_attacks.slice(1));
    if (attack === null) return null;
    move.attacks.push(attack);
  }
  return move;
}

function showmove(move) {
  msg = move.isdwarfmove ? 'd ' : 'T ';
  msg += showcoord(move.from);
  msg += '-';
  msg += showcoord(move.to);
  for (var ix=0 ; ix<move.attacks.length ; ix+=1) {
    msg += 'x';
    msg += showcoord(move.attacks[ix]);
  }
  return msg;
}

var app = new Vue({
  data: {
    COLS: ['A','B','C','D','E','F','G','H','J','K','L','M','N','O','P'],
    dwarfscapt: 0,
    trollscapt: 0,
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
    legalshove: Array(15).fill(0).map(x=>Array(15).fill(false)),
    legaltarget: Array(15).fill(0).map(x=>Array(15).fill(false)),
    selectpiece: true,
    selectdest: false,
    selectattack: false,
    movefrom: {x:-1,y:-1},
    attackfrom: {x:-1,y:-1},
    curmove: 'd ',
    moves: [],
  },
  methods: {
    selectable: function (x,y) {
      if (this.selectpiece) {
        return (this.isdwarfturn && this.thudboard[y][x] == 'd'
                || ! this.isdwarfturn && this.thudboard[y][x] == 'T');
      }
      else if (this.selectdest) return this.legalmoveto[y][x];
      else if (this.selectattack) return this.legaltarget[y][x];
      else return false;
    },
    selected: function (x,y) {
      if (this.selectpiece) return false;
      else if (this.selectdest) return this.movefrom.x == x
                                       && this.movefrom.y == y;
      else if (this.selectattack) return this.attackfrom.x == x
                                         && this.attackfrom.y == y;
      else return false;
    },
    isattack: function (x,y) {
      if (this.selectpiece) return false;
      else if (this.selectdest) return this.legalattack[y][x];
      else if (this.selectattack) return this.legaltarget[y][x];
      else return false;
    },
    onecapt: function (x,y) {
      if (this.selectdest
          && ! this.isdwarfturn
          && this.legalattack[y][x]
          && ! this.legalshove[y][x]
          && this.alldwarfneighbors(coord(x,y)).length > 1) return true;
      else return false;
    },
    domove: function (raw_move) {
      move = parsemove(raw_move);
      if (move === null) return;

      this.clearmovestate();
      this.thudboard[move.from.y][move.from.x] = ' ';
      for (var ix=0 ; ix<move.attacks ; ix+=1) {
        this.thudboard[move.attacks[ix].y][move.attacks[ix].x] = ' ';
      }
      this.thudboard[move.to.y][move.to.x] = move.isdwarfmove ? 'd' : 'T';
      this.moves.push(showmove(move));
      this.isdwarfturn = ! move.isdwarfmove;
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

          this.curmove += showpos(x,y) + '-';
          return;
        }
        // else fall through to clear state
      }
      else if (this.selectdest) {
        if (this.legalmoveto[y][x]) {
          var piece = this.thudboard[this.movefrom.y][this.movefrom.x];
          Vue.set(this.thudboard[this.movefrom.y], this.movefrom.x, ' ');
          Vue.set(this.thudboard[y], x, piece);

          this.curmove += showpos(x,y);

          if (this.legalattack[y][x]) {
            if (this.isdwarfturn) {
              this.trollscapt += 1;
              this.curmove += 'x' + showpos(x,y);
            }
            else {
              var attacks = this.alldwarfneighbors(coord(x,y));
              if (this.legalshove[y][x] || attacks.length == 1) {
                for (var ix=0 ; ix<attacks.length ; ix+=1) {
                  Vue.set(this.thudboard[attacks[ix].y], attacks[ix].x, ' ');
                  this.dwarfscapt += 1;
                  this.curmove += 'x' + showcoord(attacks[ix]);
                }
              }
              else {
                // troll attack which isn't shove with multiple dwarfs adjacent
                this.selectpiece = false;
                this.selectdest = false;
                this.selectattack = true;
                this.attackfrom = {x:x,y:y};
                for (var ix=0 ; ix<attacks.length ; ix+=1) {
                  Vue.set(this.legaltarget[attacks[ix].y], attacks[ix].x, true);
                }
                this.curmove += 'x';
                return;
              }
            }
          }
          this.isdwarfturn = ! this.isdwarfturn;

          this.moves.push(this.curmove);
          // fall through to clear state
        }
        // else fall through to clear state
      }
      else if (this.selectattack) {
        if (this.legaltarget[y][x]) {
          Vue.set(this.thudboard[y], x, ' ');
          this.dwarfscapt += 1;
          this.curmove += showpos(x,y);
          this.isdwarfturn = ! this.isdwarfturn;
          this.moves.push(this.curmove);
        }
        else {
          // reset troll partial move
          var piece = this.thudboard[this.attackfrom.y][this.attackfrom.x];
          Vue.set(this.thudboard[this.attackfrom.y], this.attackfrom.x, ' ');
          Vue.set(this.thudboard[this.movefrom.y], this.movefrom.x, piece);
        }
        // fall through to clear state
      }

      // move canceled or completed: clear state
      this.clearmovestate();
    },
    clearmovestate: function () {
      this.curmove = this.isdwarfturn ? 'd ' : 'T ';
      this.movefrom = {x:-1,y:-1};
      this.attackfrom = {x:-1,y:-1};
      this.selectpiece = true;
      this.selectdest = false;
      this.selectattack = false;
      this.legalmoveto = Array(15).fill(0).map(x=>Array(15).fill(false));
      this.legalattack = Array(15).fill(0).map(x=>Array(15).fill(false));
      this.legalshove = Array(15).fill(0).map(x=>Array(15).fill(false));
      this.legaltarget = Array(15).fill(0).map(x=>Array(15).fill(false));
    },
    setlegalmoveto : function() {
      if (this.isdwarfturn) {
        for (var ix=0 ; ix<dirs.length ; ix+=1) {
          for (var dist=1 ; dist<SIZE ; dist+=1) {
            var dest = coord(this.movefrom.x + dirs[ix].dx*dist,
                             this.movefrom.y + dirs[ix].dy*dist);
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
      if (this.isdwarfturn) {
        for (var ix=0 ; ix<dirs.length ; ix+=1) {
          for (var dist=1 ; dist<SIZE ; dist+=1) {
            var dest = coord(this.movefrom.x + dirs[ix].dx*dist,
                             this.movefrom.y + dirs[ix].dy*dist);
            var check = coord(this.movefrom.x - dirs[ix].dx*(dist-1),
                              this.movefrom.y - dirs[ix].dy*(dist-1));
            if (! inbounds(check)) break;
            if (this.thudboard[check.y][check.x] != 'd') break;
            if (! inbounds(dest)) break;
            if (this.thudboard[dest.y][dest.x] == 'T') {
              Vue.set(this.legalmoveto[dest.y], dest.x, true);
              Vue.set(this.legalattack[dest.y], dest.x, true);
              break;
            }
            if (this.thudboard[dest.y][dest.x] != ' ') break;
          }
        }
      }
      else {
        for (var ix=0 ; ix<dirs.length ; ix+=1) {
          for (var dist=1 ; dist<SIZE ; dist+=1) {
            var dest = coord(this.movefrom.x + dirs[ix].dx*dist,
                             this.movefrom.y + dirs[ix].dy*dist);
            var check = coord(this.movefrom.x - dirs[ix].dx*(dist-1),
                              this.movefrom.y - dirs[ix].dy*(dist-1));
            var check2 = coord(this.movefrom.x - dirs[ix].dx*dist,
                               this.movefrom.y - dirs[ix].dy*dist);
            if (! inbounds(check)) break;
            if (this.thudboard[check.y][check.x] != 'T') break;
            if (! inbounds(dest)) break;
            if (this.thudboard[dest.y][dest.x] != ' ') break;
            if (this.hasdwarfneighbor(dest)) {
              Vue.set(this.legalmoveto[dest.y], dest.x, true);
              Vue.set(this.legalattack[dest.y], dest.x, true);
              if (dist > 1 || inbounds(check2)
                              && this.thudboard[check2.y][check2.x] == 'T') {
                Vue.set(this.legalshove[dest.y], dest.x, true);
              }
            }
          }
        }
      }
    },
    hasdwarfneighbor: function (pos) {
      for (var ix=0 ; ix<dirs.length ; ix+=1) {
        var check = coord(pos.x + dirs[ix].dx, pos.y + dirs[ix].dy);
        if (inbounds(check) && this.thudboard[check.y][check.x] == 'd') {
          return true;
        }
      }
      return false;
    },
    alldwarfneighbors: function (pos) {
      var neighbors = [];
      for (var ix=0 ; ix<dirs.length ; ix+=1) {
        var check = coord(pos.x + dirs[ix].dx, pos.y + dirs[ix].dy);
        if (inbounds(check) && this.thudboard[check.y][check.x] == 'd') {
          neighbors.push(check);
        }
      }

      return neighbors;
    },
    pl: function(n) {
      if (n == 1) return '';
      else return 's';
    },
  },
});
