const fs = require('fs');
const readline = require('readline');
const { Readable } = require('stream');
const CMX3600Parser = require('../CMX3600Parser/CMX3600Parser');

class EditDecisionList {
  constructor(frameRate = 29.97, type = 'cmx3600') {
    this.frameRate = frameRate;
    this.type = type;
    this.events = [];

    switch (this.type) {
      case 'cmx3600':
      default:
        this.parser = CMX3600Parser;
    }
  }

  async readFile(inputFile) {
    const stream = readline.createInterface({
      input: fs.createReadStream(inputFile),
      crlfDelay: Infinity,
    });

    return this.parser(stream, this.frameRate)
      .then((events) => {
        this.events = events;
        return this;
      });
  }

  async fromString(string) {
    const stream = readline.createInterface({
      input: Readable.from([string]),
      crlfDelay: Infinity,
    });

    return this.parser(stream, this.frameRate)
      .then((events) => {
        this.events = events;
        return this;
      });
  }

  toJSON(stringify) {
    const json = this.events.map((event) => event.toJSON(false));

    if (stringify === true) return JSON.stringify(json);

    return json;
  }

  filterDuplicateMultitrack() {
    const filtered = new EditDecisionList(this.frameRate);

    filtered.events = this.events.filter((event, index) => {
      if (index === 0) return true;

      if (event.reel === this.events[index - 1].reel
          && event.trackType === this.events[index - 1].trackType
          && event.sourceClip === this.events[index - 1].sourceClip
          && event.sourceFile === this.events[index - 1].sourceFile
          && event.sourceStart.toString() === this.events[index - 1].sourceStart.toString()
          && event.sourceEnd.toString() === this.events[index - 1].sourceEnd.toString()
          && event.recordStart.toString() === this.events[index - 1].recordStart.toString()
          && event.recordEnd.toString() === this.events[index - 1].recordEnd.toString()
      ) return false;

      return true;
    });

    return filtered;
  }
}

module.exports = EditDecisionList;