# CSCC09 Project proposal
- VIDEO: https://youtu.be/8rjxC74FvHc
- URL: www.mytexas.ca
- API Documentation: [./doc/README.md](./doc/README.md)


## Project Title
Online Free Texas Holdem Play 
## Team Members
- Jinyang Hu
- Hongda Huang
- Xueli Tan

## Description of the web application<br />
Texas Holdem is a variation of the card game of poker, the rules is here https://www.instructables.com/id/Learn-To-Play-Poker---Texas-Hold-Em-aka-Texas-Ho/
 What we gonna build is an Online multiplayer Texas Holdem card game. It is a free game only used for entertainment purpose. Application features will exactly follow the rules in above link. In addition, it also supports multiple tables running in same time( each table is a single game session), each table can have 3-6 players, and run 5 rounds of the game. After 5 rounds, the game will end and a statistic result of players gold will be displayed, player can choose to stay in the same table for a new game or go other tables. Each player would have 250 gold when they join any table, player who lost all of the golds has to wait until the end of the game or join other tables.


## Description of the key features that will be completed by the Beta version<br />
- Frontend, frontend controller, backend server set up.
- For Beta version, we will mainly focus on the data transmission between web and server, and how to real-time update the frontend display. Therefore we will spend less time on game interface design. The frontend UI of the game display would be text main. If we still have time we will add an image to poker card, gold, user icon display...
- All game functions(rules) within a table will be completed.
- The game can run with only 3-6 players and supports only one table in the server.


## Description of additional features that will be complete by the Final version<br />
- Web and game interface improvement.
- Game background, Poker card, User icon must be displayed as an image. Make it look good.
- Supports multiple tables running in same time. Players can randomly join a table or send invite link to friends and play with friends.


## Description of the technology that you will use<br />
For this game, we choose the HTML5 game platform. We choose Web Audio API for audio, WebGL and/or canvas for the graphics. The programming language is JavaScript. In order to support multiple users, we use WebRTC and WebSockets. Nedb is the database. In addition, HTML and CSS are selected to build the web front end. TouchEvents are used for gameplay.


## Description of the top 5 technical challenges
- Multiple users play at the same table at the same time
- Backend handles multiple tables in the game
- Backend game judgment
- Game interaction between users
- Use Web Sockets to synchronization between client and server

## API
- Since most real-time synchronization has done by Web Socket, not much api method are used

### Read

- description: retrieve the newest image
- request: `GET /`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: user id
      - table: user table
      - gold: user gold

```
$ curl -b cookie.txt -c cookie.txt -k
        http://localhsot:3001/
```

### Test

- description: retrieve the newest image
- request: `GET /users/`   
- response: 200
    - content-type: `application/json`
    - body: list of objects
      - id: user id
      - username: username

```
$ curl -b cookie.txt -c cookie.txt -k
        http://localhsot:3001/users/
```
