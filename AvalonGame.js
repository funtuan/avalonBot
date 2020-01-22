class AvalonGame {
  constructor(roomId) {
    this.roomId = roomId;
    this.userList = [];

    this.round = 0;
    this.roundList = {
      1: {
        people: 2,
        fail: 0,
      },
      2: {
        people: 3,
        fail: 0,
      },
      3: {
        people: 2,
        fail: 0,
      },
      4: {
        people: 3,
        fail: 1,
      },
      5: {
        people: 3,
        fail: 0,
      },
    };

    this.identityIntroduction = [{
      id: 0,
      name: '梅林',
      description: '你能知道誰是壞人',
      look: [3, 4],
      lookDescription: '他們是壞人',
    }, {
      id: 1,
      name: '派西維爾',
      description: '你能知道誰是梅林、魔甘娜',
      look: [0, 3],
      lookDescription: '他們是梅林或魔甘娜',
    }, {
      id: 2,
      name: '忠臣',
      description: '請幫助好人勝利',
      look: [],
      lookDescription: '',
    }, {
      id: 3,
      name: '魔甘娜',
      description: '你能知道誰是你的壞人夥伴',
      look: [4],
      lookDescription: '他是你的壞人夥伴',
    }, {
      id: 4,
      name: '刺客',
      description: '請找出梅林，回合結束你還有刺殺的機會',
      look: [],
      lookDescription: '',
    }];

    this.record = [];

    this.leaderId = -1;
    this.team = [];
    this.teamVote = null;
  }

  resetVote() {
    this.vote = {
      success: 0,
      fail: 0,
    };
    this.voted = [];
  };

  async addUser(user) {
    const me = this.userList.filter((item) => item.userId === user.userId);
    if (me.length > 0) {
      throw new Error('你已加入遊戲');
    }
    if (this.round !== 0) {
      throw new Error('遊戲已開始');
    }
    if (this.userList.length === 5) {
      throw new Error('人數已滿');
    }
    user.id = this.userList.length + 1;
    user.identity = -1;
    this.userList.push(user);
  }

  async start() {
    if (this.round !== 0) {
      throw new Error('遊戲已開始');
    }
    if (this.userList.length < 5) {
      throw new Error('人數未滿5人');
    }
    for (let i = 0; i < this.identityIntroduction.length; i++) {
      while (true) {
        const index = Math.floor(Math.random() * this.userList.length);
        if (this.userList[index].identity === -1) {
          this.userList[index].identity = i;
          break;
        }
      }
    }
    this.round = 1;
    this.leaderId = Math.floor(Math.random() * this.userList.length);
    return this.showLeader();
  }

  async showLeader() {
    const leader = this.userList.filter((item) => item.id === this.leaderId)[0];
    return {
      leader,
      round: this.roundList[this.round],
    };
  }

  async setTeam(userId, teamIds) {
    const me = this.userList.filter((item) => item.userId === userId && item.id === this.leaderId);
    if (me.length === 0) {
      throw new Error('你不是領導者');
    }
    if (this.round === 0) {
      throw new Error('遊戲尚未開始');
    }
    const team = this.userList.filter((item) => teamIds.indexOf(item.id) !== -1);
    if (team.length > this.roundList[this.round].people) {
      throw new Error(`你只能派遣${this.roundList[this.round].people}人`);
    }
    if (team.length < this.roundList[this.round].people) {
      throw new Error(`你需要派遣${this.roundList[this.round].people}人`);
    }
    this.team = team;
    this.resetVote();
    this.teamVote = new Vote(this.userList);
    return this.showTeam();
  }

  async showTeam() {
    const leader = this.userList.filter((item) => item.id === this.leaderId)[0];
    return {
      leader,
      team: this.team,
    };
  }

  async voteTeam(userId, vote) {
    return this.teamVote.vote(userId, vote);
  }

  async checkVoteTeam() {
    if (this.team.length === 0) {
      throw new Error(`未選擇隊伍`);
    }
    if (this.teamVote.whoNotVote().length !== 0) {
      throw new Error(`還有${this.teamVote.whoNotVote().length}人尚未投票`);
    }
    if (this.teamVote.success > this.teamVote.fail) {
      return this.goTask();
    } else {
      this.leaderId = (this.leaderId + 1) % this.userList.length;
      this.team = [];
      return 'fail';
    }
  }

  async goTask() {
  }

  async me(userId) {
    const me = this.userList.filter((item) => item.userId === userId);
    if (me.length === 0) {
      throw new Error('你不在遊戲中');
    }
    if (this.round === 0) {
      throw new Error('遊戲尚未開始');
    }
    const introduction = Object.assign({}, this.identityIntroduction[me[0].identity]);
    introduction.lookUser = introduction.look.map((identity) => {
      return this.userList.filter((one) => one.identity === identity)[0];
    });

    return introduction;
  }
}

class Vote {
  constructor(userList) {
    this.userList = userList;
    this.voded = [];
    this.success = 0;
    this.fail = 0;
  }

  async vote(userId, vote) {
    const me = this.userList.filter((item) => item.userId === userId);
    if (me.length === 0) {
      throw new Error('你無法投票');
    }
    const meVoded = this.voded.filter((item) => item.userId === userId);
    if (meVoded.length !== 0) {
      throw new Error('你已投過票');
    }
    this.voded.push(me[0]);
    if (vote) {
      this.success++;
    } else {
      this.fail++;
    }
  }

  async whoNotVote() {
    return this.userList.filter((item) => voded.indexOf(item.userId) === -1);
  }
}


const game = new AvalonGame('123456');
game.addUser({
  userId: '1',
  name: 'hank0',
});
game.addUser({
  userId: '2',
  name: 'hank1',
});
game.addUser({
  userId: '3',
  name: 'hank2',
});
game.addUser({
  userId: '4',
  name: 'hank3',
});
game.addUser({
  userId: '5',
  name: 'hank4',
});
game.start().then((value) => {
  console.log(value);
  game.me('2').then((value) => {
    console.log(value);
  });
}).catch((err) => {
  console.log(err.message);
});
