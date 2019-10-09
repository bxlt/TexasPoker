var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var serv = require('http').createServer(app);
var PokerEvaluator = require("poker-evaluator");


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

/**
 * Get port from environment and store in Express.
 */

var port = process.env.PORT || '3001';
app.set('port', port);
console.log("Server started at", port);


/**
 * Listen on provided port, on all network interfaces.
 */

serv.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// start new code
var SOCKET_LIST = {};
var PLAYER_LIST = [];
var TABLE_LIST = {};

var card = [ "2c","2d","2h","2s","3c","3d","3h","3s","4c","4d","4h","4s","5c","5d","5h","5s","6c","6d","6h","6s","7c","7d","7h","7s","8c","8d","8h","8s","9c","9d","9h","9s","tc","td","th","ts","jc","jd","jh","js","qc","qd","qh","qs","kc","kd","kh","ks","ac","ad","ah","as"];

function generate_random_card(cards){
    var number = Math.floor(Math.random()*cards.length);
    result = cards[number];
    cards.splice(number,1);
    return result;
}

var Player = function(id,socket){
    var self = {
        id:id,
        name:null,
        socket:socket,
        table:null,
        gold:250,
        ready:false,
        pocket:[],
        paid:0,
        acted:false,
        fold:false,
        allin:false,
        this_wave_paid:0,

    }


    self.pay = function(amount){
        self.gold-=amount;
        self.paid+=amount;
        self.this_wave_paid+=amount;
    }


    self.call = function(gold){
        var added = gold-self.paid
        if(self.gold == added){
            self.allin = true;
        }
        self.pay(gold-self.paid);

        return added;

    }

    self._fold = function(){
        self.fold = true;
    }

    self.raise = function(amount){
        self.pay(amount);
    }

    self.win = function(amount){
        self.gold += amount;
    }

    self.set_name = function(name){
        self.name = name;
    }



    return self;
}

var Table = function(id){
    var self = {
        id:id,
        players:{},
        num_player:0,
        current_turn:null,
        order:[],
        board_cards:[],
        table_status:false,
        ThePot:0,
        current_bet:10,
        game_status:false,
        smallBlind:null,
        bigBlind:null,
        dealer:null,
        winner:null,
        last_raise:10,
        card_pack: null

    }

    self.player_notify = function(){
        if(self.game_status=="End"){
            var number_folded = 0;
            player_information=[];
            for( var i in self.players){
                if(self.players[i].fold){
                    number_folded+=1;
                }
            }
            if(number_folded==self.num_player-1){
                for(var x in self.order){
                var temp = self.players[self.order[x]];
                player_information.push({id:temp.id,name:temp.name, table:temp.table,ready:temp.ready, cards:["back","back"],gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
                }
            }else{
                for(var x in self.order){
                    var temp = self.players[self.order[x]];
                    if(!temp.fold){
                        player_information.push({id:temp.id,name:temp.name,table:temp.table,ready:temp.ready, cards:temp.pocket,gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
                    }
                    else{
                        player_information.push({id:temp.id,name:temp.name,table:temp.table,ready:temp.ready, cards:["back","back"],gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
                    }

                }
            }
            for(var x in self.order){
                var temp = self.players[self.order[x]];
                temp.socket.emit("player_information",player_information);
            }
        }
        else if(self.game_status==false){
            player_information=[];
            for(var x in self.order){
                var temp = self.players[self.order[x]];
                player_information.push({id:temp.id,name:temp.name,table:temp.table,ready:temp.ready, cards:temp.pocket,gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
            }

            for(var x in self.order){
                var temp = self.players[self.order[x]];
                temp.socket.emit("player_information",player_information);
            }

        }
        else{
            for(var x in self.order){
                player_information = []
                for(var a in self.order){
                    var temp = self.players[self.order[a]];
                    if(x==a){
                        player_information.push({id:temp.id,name:temp.name,table:temp.table,ready:temp.ready, cards:temp.pocket,gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
                    }
                    else{
                        player_information.push({id:temp.id,name:temp.name,table:temp.table,ready:temp.ready, cards:["back","back"],gold:temp.gold,paid:temp.paid,this_wave_paid:temp.this_wave_paid, fold:temp.fold, allin:temp.allin});
                    }

                }
            self.players[self.order[x]].socket.emit("player_information",player_information);

            }
        }

    }

    self.board_notify = function(){
        board_information = []
        board_information.push({id:self.id,current_turn:self.order[self.current_turn],table_status:self.table_status,ThePot:self.ThePot,current_bet:self.current_bet,game_status:self.game_status,board_cards:self.board_cards,last_raise:self.last_raise});


        for(var i in self.players){
            var player_socket = self.players[i].socket;
            player_socket.emit("board_information",board_information);

        }
    }


    self.addplayer = function(new_player){
        if(self.table_status){

            return new_player.socket.emit('_error',"Game is running, please wait");
        }
        if(self.num_player==6){
            return new_player.socket.emit('_error',"Reached Max players, please join another table");
        }
        self.players[new_player.id]=new_player;
        self.players[new_player.id].gold = 250;
        self.players[new_player.id].fold = false;
        self.players[new_player.id].pocket=[];
        self.players[new_player.id].ready=false;

        self.order.push(new_player.id);
        self.num_player += 1;
        self.player_notify();
        self.board_notify();

    }

    self.next = function(current_turn){

        if(self.current_turn<self.num_player-1){
           self.current_turn+=1;
        }
        else{
            self.current_turn = 0;
        }
    }

    self.player_quit = function(id){
        self.num_player-=1;

        delete self.players[id];
        var pos = null;
        for(var i =0;i<self.order.length;i++){
            if(self.order[i]==id){
                pos = i;
            }
        }
        self.order.splice(pos,1);

        if(self.table_status && self.num_player==1){
            self.winner = self.order[0];
            self.players[self.order[0]].win(self.ThePot);
            self.ThePot = 0;
            self.player_notify();
            self.board_notify();
            for(var i in self.players){
                self.players[i].socket.emit("winner", self.winner);
            }
            self.end_game();
        }

        if(self.num_player==0){
            self.end_game();
            self.board_cards=[];
            self.game_status=false;
        }

        self.player_notify();
        self.board_notify();

    }

    self.generate_players_cards=function(){
        for(var i in self.players){
            var temp = self.players[i];
            temp.pocket=[];
            temp.pocket.push(generate_random_card(self.card_pack));
            temp.pocket.push(generate_random_card(self.card_pack));
            temp.socket.emit("your_cards",temp.pocket);
        }

    }

    self.generate_board_cards=function(){
        self.board_cards.push(generate_random_card(self.card_pack));
        self.board_cards.push(generate_random_card(self.card_pack));
        self.board_cards.push(generate_random_card(self.card_pack));

    }

    self.assign_identity=function(){
        self.dealer = 0;
        self.smallBlind = 1;
        self.bigBlind = 2;

        if(self.num_player==3){
            current_turn = 0;
        }
        else{
            current_turn = 3;
        }

    }

    self.check_round_end= function(){
        var number_folded = 0;
        var number_allin = 0;
        var result = true;
        for(var i in self.players){
            var temp = self.players[i];
            if(temp.fold){
                number_folded+=1;
            }
            else{
                if(temp.paid != self.current_bet){
                    if(!temp.allin){
                        result = false;
                    }

                }
                if(!temp.acted){
                    result = false;
                }
            }
            if(temp.allin){
                number_allin+=1;
            }



        }

        if(number_folded == self.num_player-1){
            self.game_status = "EarlyEnd";
            return true;
        }

        if(number_folded+number_allin == self.num_player){
            self.game_status="End";
            self.table_status=false;
            while(self.board_cards.length<5){
                self.board_cards.push(generate_random_card(self.card_pack));
            }
            self.winner_calculator();
            self.end_game();
            return true;

        }

        return result;
    }




    self.initial_game = function(){
        self.card_pack=card.slice();
        self.generate_players_cards();
        self.game_status="PreFlop";
        var bigBlind = self.players[self.order[self.bigBlind]];
        bigBlind.pay(10);
        self.ThePot+=10;
        var smallBlind = self.players[self.order[self.smallBlind]];
        smallBlind.pay(5);
        self.ThePot+=5;
        self.current_turn = bigBlind;
        self.next();
        self.player_notify();
        self.board_notify();

    };

    self.clean_act = function(){
        for(var i in self.players){
            var temp = self.players[i];
            temp.acted = false;
            temp.this_wave_paid=0;
        }
    };

    self.player_action = function(id,data){
        var temp = self.players[id];
        temp.acted = true;
        switch(data.action){
            case("call"):
                self.ThePot += temp.call(self.current_bet);
                break;

            case("fold"):
                temp._fold();
                break;
            case("raise"):
                var raised = parseInt(data.amount, 10)
                if(raised<self.last_raise){
                    return;
                }
                self.ThePot += temp.call(self.current_bet);
                self.current_bet+=raised;
                self.ThePot += raised;
                self.last_raise = raised;

                temp.raise(raised);
                break;
            case("allin"):
                temp.allin = true;
                if(!((temp.gold+temp.paid) <= self.current_bet)){
                    
                    self.last_raise = temp.gold-self.current_bet;
                    self.current_bet = temp.gold+temp.paid;

                }
                self.ThePot+=temp.gold;
                temp.pay(temp.gold);
                break;


        }

        if(self.check_round_end()){
            var number_allin = 0;
            for(var i in self.players){
                var temp = self.players[i];
                if(temp.allin){
                    number_allin+=1;
                }
            }

            if(number_allin==self.num_player-1){
                self.game_status="End";
                self.table_status=false;
                while(self.board_cards.length<5){
                    self.board_cards.push(generate_random_card(self.card_pack));
                }
                self.winner_calculator();
                self.end_game();
            }

            switch(self.game_status){
                case("PreFlop"):
                    self.game_status = "TheFlop";
                    self.last_raise=10;
                    self.clean_act();
                    self.TheFlop();
                    break;
                case("TheFlop"):
                    self.game_status = "TheTurn";
                    self.last_raise=10;
                    self.clean_act();
                    self.TheTurn();
                    break;
                case("TheTurn"):
                    self.game_status = "TheRiver";
                    self.last_raise=10;
                    self.clean_act();
                    self.TheRiver();
                    break;
                case("TheRiver"):
                    self.game_status = "End";
                    self.table_status= false;
                    self.clean_act();
                    self.winner_calculator();
                    self.end_game();
                    break;
                case("EarlyEnd"):
                    for(var i in self.players){
                        temp = self.players[i];
                        if(!temp.fold){
                            self.winner = temp.id;
                        }
                    }
                    for(i in self.players){
                        self.players[i].socket.emit("winner", self.winner);
                    }
                    self.players[self.winner].win(self.ThePot);
                    self.end_game();

                    break;

            }
        }else{
            self.next();
            while(self.players[self.order[self.current_turn]].fold || self.players[self.order[self.current_turn]].allin ){
                self.next();
            }

        }

        self.player_notify();
        self.board_notify();
    };

    self.winner_calculator = function(){
        var max = 0;
        var rank = {};
        var winner = null;
        var type = null;
        var pack = [];
        for(var i in self.players){
            var temp = self.players[i];
            if(!temp.fold){
                var eval = PokerEvaluator.evalHand(temp.pocket.concat(self.board_cards));
                if(eval.value>max){
                    max = eval.value;
                    winner = temp.id;
                    type = eval.handName;
                }
            }

        }

        pack.push(winner);
        pack.push(type);
        for(i in self.players){
            self.players[i].socket.emit("winner", pack);
        }

        if(self.players[winner].allin){
            for(i in self.players){
                if(self.players[i].paid>self.players[winner].paid){
                    self.players[i].win(self.players[i].paid-self.players[winner].paid);
                    self.ThePot-=(self.players[i].paid-self.players[winner].paid);
                }
            }
        }

        self.players[winner].win(self.ThePot);
        self.ThePot = 0;

    };

    self.TheFlop = function(){
        if(self.players[self.order[self.smallBlind]].fold){
            self.next();
            while(self.players[self.order[self.current_turn]].fold){
                self.next();
            }
        }
        else{
            self.current_turn = self.smallBlind;
        }

        self.generate_board_cards();

    };

    self.TheTurn = function(){
        if(self.players[self.order[self.smallBlind]].fold){
            self.next();
            while(self.players[self.order[self.current_turn]].fold){
                self.next();
            }
        }
        else{
            self.current_turn = self.smallBlind;
        }
        self.board_cards.push(generate_random_card(self.card_pack));
        self.board_notify();
    };

    self.TheRiver = function(){
        if(self.players[self.order[self.smallBlind]].fold){
            self.next();
            while(self.players[self.order[self.current_turn]].fold){
                self.next();
            }
        }
        else{
            self.current_turn = self.smallBlind;
        }
        self.board_cards.push(generate_random_card(self.card_pack));
        self.board_notify();
    };

    self.start_game = function(){
        var can_start = true;
        for(var i in self.players){
            var temp = self.players[i];
            if(!temp.ready){
                can_start = false;
            }
        }

        if(can_start){
            if(self.num_player<3){
                return ;
            }
            self.clean_table_and_player();
            self.table_status = true;

            self.assign_identity();
            self.initial_game();

        }
    };

    self.end_game = function(){
        for(var i in self.players){
            var temp = self.players[i];
            temp.ready = false;
            temp.paid = 0;
            temp.act = false;
            temp.allin = false;
            temp.this_wave_paid=0;
        }
        self.current_turn = null;
        self.ThePot = 0;
        self.table_status = false;
        self.current_bet=10;
        self.game_status="End";
        self.smallBlind=null;
        self.bigBlind=null;
        self.dealer=null;
        self.winner=null;
        self.last_raise=10;
    };

    self.clean_table_and_player = function(){
        for(var i in self.players){
            var temp = self.players[i];
            temp.ready = false;
            temp.paid = 0;
            temp.act = false;
            temp.allin = false;
            temp.this_wave_paid=0;
            temp.fold=false;
            temp.pocket=[];
        }
        self.board_cards = [];
        self.current_turn = null;
        self.ThePot = 0;
        self.table_status = false;
        self.current_bet=10;
        self.game_status="End";
        self.smallBlind=null;
        self.bigBlind=null;
        self.dealer=null;
        self.winner=null;
        self.last_raise=10;
    };
    return self;

};

TABLE_LIST[0]=Table(0);
TABLE_LIST[1]=Table(1);
TABLE_LIST[2]=Table(2);

function sum_table(){
    var pack = [];
    for(var i in TABLE_LIST){
        pack.push({id:TABLE_LIST[i].id,players:TABLE_LIST[i].num_player});
    }
    return pack;

}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    socket.id = "" + Math.floor(500 * Math.random());
    var player = Player(socket.id,socket);
    PLAYER_LIST.push(player);

    socket.on("join",function(data){
        if(player.table!=null){

            TABLE_LIST[player.table].player_quit(socket.id);
            player.table=null;

        }
        if(TABLE_LIST[data.id].table_status){
            socket.emit('_error',"Game is running, please wait");
        }
        else{
            player.table = data.id;
            TABLE_LIST[data.id].addplayer(player);
        }

        socket.emit("your_information",{id:socket.id,table:player.table, name:player.name});


    });


    socket.emit("your_information",{id:socket.id,name:"please set a name first",table:"please join a table first!!"});

   //need modify
    socket.on('disconnect',function(){
        if(player.table!=null){
            TABLE_LIST[player.table].player_quit(socket.id);
        }

    });

    socket.on('ready',function(){
        if(player.gold<10){
            socket.emit("_error","Sorry, you dont have enough money, please join another table");
        }
        else{
            TABLE_LIST[player.table].players[socket.id].ready = true;
            TABLE_LIST[player.table].player_notify();
            TABLE_LIST[player.table].start_game();
        }

    })

    socket.on("action",function(data){
        TABLE_LIST[player.table].player_action(socket.id, data);
    });

    socket.on("name", function(data){
        player.set_name(data);
        if(player.table!=null){
            TABLE_LIST[player.table].player_notify();
        }
        socket.emit("your_information",{id:socket.id,table:player.table, name:player.name});

    });


});

setInterval(function(){
    if(PLAYER_LIST.length !=0){
       for(var i in PLAYER_LIST){
            PLAYER_LIST[i].socket.emit("all_table_information",sum_table());
        }
    }







},1000/25);
module.exports = app;
