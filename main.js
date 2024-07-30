function onOpen() {
  SpreadsheetApp.getUi().createMenu("Script Menu")
    .addItem("Импорт с диска", "showModalWindow")
    .addItem("Расчет", "main")
    .addToUi();
}

function main() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const valuesSheetTest = ss.getSheetByName("Test Feedback").getDataRange().getValues()
  const valuesSheetLive = ss.getSheetByName("Live Feedback").getDataRange().getValues()
  let weeks = {};
  let testFF = new Feedback(getMapFFedbackUid(valuesSheetTest), isLive = false, weeks);
  let liveFF = new Feedback(getMapFFedbackUid(valuesSheetLive), islive = true, weeks);
  const feedback = compareObjects(testFF, liveFF, weeks);
  const outputForWrite = output(feedback, weeks);
  // alert("Calculation finished!");
};

class Feedback {
  constructor(feedback, isLive, weeks) {
    for (let drafterUid of Object.keys(feedback)) {
      this[drafterUid] = {};
      this[drafterUid].name = feedback[drafterUid].name;
      this[drafterUid].uid = drafterUid;
      this[drafterUid].weeks = {};

      for (let orderAsDate of Object.keys(feedback[drafterUid].orders)) {
        let week = new Week(moment(orderAsDate))

        if (!this[drafterUid].weeks[week.weekNumber]) {
          weeks[week.weekNumber] = {
            weekStart: week.weekStart.toString(),
            weekEnd: week.weekEnd.toString()
          }
          this[drafterUid].weeks[week.weekNumber] = week
        }

        if (!isLive && feedback[drafterUid].orders[orderAsDate].recipient && !feedback[drafterUid].orders[orderAsDate].creator && feedback[drafterUid].orders[orderAsDate].recipientArray.length == 1) {
          this[drafterUid].weeks[week.weekNumber].test += feedback[drafterUid].orders[orderAsDate].st
        }

        else {
          if (isLive && feedback[drafterUid].orders[orderAsDate].creator) {
            this[drafterUid].weeks[week.weekNumber].review += feedback[drafterUid].orders[orderAsDate].reviewST
          }

          else {

            if (isLive && feedback[drafterUid].orders[orderAsDate].recipient && !feedback[drafterUid].orders[orderAsDate].creator && feedback[drafterUid].orders[orderAsDate].recipientArray.length == 1) {
              this[drafterUid].weeks[week.weekNumber].live += feedback[drafterUid].orders[orderAsDate].st
            }
          }
        }
        this[drafterUid].weeks[week.weekNumber].total = this[drafterUid].weeks[week.weekNumber].test + this[drafterUid].weeks[week.weekNumber].live + this[drafterUid].weeks[week.weekNumber].review;
      };
    };
  };
};

class Week {
  constructor(date) {
    this.weekNumber = date.isoWeek();
    this.weekStart = date.clone().startOf('isoweek');
    this.weekEnd = date.clone().endOf('isoweek');
    this.test = 0;
    this.live = 0;
    this.review = 0;
    this.total = 0;
  }
}

function compareObjects(obj1, obj2, weeks) {
  const length1 = Object.keys(obj1).length || 0;
  const length2 = Object.keys(obj2).length || 0;

  let biggestObject = obj1;
  let lowestObject = obj2;

  if (length1 < length2) {
    biggestObject = obj2;
    lowestObject = obj1;
  }

  for (let drafter of Object.keys(biggestObject)) {
    if (!lowestObject[drafter]) {
      lowestObject[drafter] = biggestObject[drafter];
    } else {
      for (let week of Object.keys(weeks)) {
        if (lowestObject[drafter].weeks[week] && biggestObject[drafter].weeks[week]) {
          lowestObject[drafter].weeks[week].test += biggestObject[drafter].weeks[week].test;
          lowestObject[drafter].weeks[week].live += biggestObject[drafter].weeks[week].live;
          lowestObject[drafter].weeks[week].review += biggestObject[drafter].weeks[week].review;
          lowestObject[drafter].weeks[week].total += biggestObject[drafter].weeks[week].total;
        }
        else {
          if (biggestObject[drafter].weeks[week]) {
            lowestObject[drafter].weeks[week] = biggestObject[drafter].weeks[week]
          }
        }
      }
    }
  }
  return lowestObject;
}

function output(drafters, weeks) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName("Calculation");
  sheet.getDataRange().clear();
  const arrayForWrite = [];
  const header = [['', ''], ["DrafterUid", "DrafterName"]];

  for (const week of Object.keys(weeks)) {
    header[0].push(`${weeks[week].weekStart}`, "", "", "");
    header[1].push("%SoloTest", "%SoloLive", "%SoloLiveReview", "Total");
  }

  for (const drafter of Object.keys(drafters)) {
    let arr = [drafter, drafters[drafter].name]
    for (const week of Object.keys(weeks)) {

      if (drafters[drafter].weeks[week] && drafters[drafter].weeks[week].weekNumber) {
        let test = percentage(drafters[drafter].weeks[week].test, drafters[drafter].weeks[week].total);
        test = test == 0 ? "" : test;

        let live = percentage(drafters[drafter].weeks[week].live, drafters[drafter].weeks[week].total);
        live = live == 0 ? "" : live;

        let review = percentage(drafters[drafter].weeks[week].review, drafters[drafter].weeks[week].total);
        review = review == 0 ? "" : review;

        let total = getTimeFromMins(drafters[drafter].weeks[week].total);
        total = total == "0h 0m" ? "" : total;

        arr.push(test, live, review, total)
      }
      else {
        arr.push("", "", "", "")
      }
    }
    arrayForWrite.push(arr)
  }
  const arr1 = header.concat(arrayForWrite)
  sheet.getRange(1, 1, arr1.length, arr1[0].length).setValues(arr1)
  return arr1
}

function percentage(time, total) {

  if (time == 0 || total == 0) {
    return 0
  }
  
  else {
    return (time * 100 / total).toFixed()
  }
}

function getTimeFromMins(mins) {
  let hours = Math.trunc(mins / 60);
  let minutes = mins % 60;
  return hours + 'h ' + minutes + 'm';
};
