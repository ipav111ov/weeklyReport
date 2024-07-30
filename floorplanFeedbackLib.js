const idFFeedback_ = '1ZhjL_yr5Gtx-_SdCxhExNz_44ZOSH8C0H2lcjEFeY-c';
const sheetName_ = 'emplanner';
const indexColumnDate_ = 0;
const indexColumnOrderId_ = 1;
const indexColumnPlatform_ = 2;
const indexColumnCreator_ = 3;
const indexColumnRecipients_ = 4;
const indexColumnType_ = 5;
const indexColumnMark_ = 6;
const indexColumnComment_ = 7;
const indexColumnSquare_ = 8;
const indexColumnCameras_ = 9;
const indexColumnSpentTime_ = 10;
const indexColumnReviewSpentTime_ = 11;
const indexColumnCreatorUID_ = 12;
const indexColumnRecipientsUID_ = 13;

/**
 * returns structured data on employees from "Floorplan Feedback"
 * with moment
 * @return {map} the data from "Floorplan Feedback"
 */

function getMapFFedback(id = idFFeedback_) {
  const sheet = SpreadsheetApp.openById(id).getSheetByName(sheetName_);
  const rangeData = sheet.getDataRange();
  const values = rangeData.getValues().slice(1);
  const result = {}
  for (let indexRow in values) {
    const row = values[indexRow];
    const date = moment(row[indexColumnDate_]);
    const orderId = row[indexColumnOrderId_];
    const platform = row[indexColumnPlatform_];
    const creator = row[indexColumnCreator_];
    const recipients = row[indexColumnRecipients_];
    const type = row[indexColumnType_];
    const mark = row[indexColumnMark_];
    const square = row[indexColumnSquare_];
    const cameras = row[indexColumnCameras_];
    const st = row[indexColumnSpentTime_];
    const reviewST = row[indexColumnReviewSpentTime_];
    const recipientsArr = recipients? recipients.split(','):[];
    let creatorFlag = false;
    for (let indexRecipient in recipientsArr) {
      const recipient = recipientsArr[indexRecipient];
      result[recipient] = addIfNotExist_(result[recipient]);
      if (creator.indexOf(recipient) == 0 && creator.length == recipient.length) {
        result[recipient][date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, true, true, recipientsArr);
        creatorFlag = true;
      } else {
        result[recipient][date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, true, false, recipientsArr);
      }
    }
    if (!creatorFlag) {
      result[creator] = addIfNotExist_(result[creator]);
      result[creator][date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, false, true, recipientsArr);
    }
  }
  return result;
}

/**
 * returns structured data on employees from "Floorplan Feedback"
 * with moment
 * @return {map} the data from "Floorplan Feedback"
 */
function getMapFFedbackUid(id) {
  // const sheet = SpreadsheetApp.openById(id).getSheetByName(sheetName_);
  // const rangeData = sheet.getDataRange();
  const values = id.slice(1);
  const result = {}
  for (let indexRow in values) {
    const row = values[indexRow];
    const date = moment(row[indexColumnDate_]);
    const orderId = row[indexColumnOrderId_];
    const platform = row[indexColumnPlatform_];
    const creator = row[indexColumnCreator_];
    const creatorUid = row[indexColumnCreatorUID_]
    const recipients = row[indexColumnRecipients_];
    const recipientsUid = row[indexColumnRecipientsUID_];
    const type = row[indexColumnType_];
    const mark = row[indexColumnMark_];
    const square = row[indexColumnSquare_];
    const cameras = row[indexColumnCameras_];
    const st = row[indexColumnSpentTime_];
    const reviewST = row[indexColumnReviewSpentTime_];
    const recipientsArr = recipients? recipients.split(','):[];
    const recipientsArrUid = recipientsUid? recipientsUid.split(','):[];
    
    let creatorFlag = false;
    for (let indexRecipient in recipientsArrUid) {
      const recipientUid = recipientsArrUid[indexRecipient];
      if (!result[recipientUid]) {
        result[recipientUid] = {};
        result[recipientUid].orders = {};
        result[recipientUid].name = recipientsArr[indexRecipient]
      }
      if (creatorUid.indexOf(recipientUid) == 0 && creatorUid.length == recipientUid.length) {
        result[recipientUid].orders[date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, true, true, recipientsArrUid);
        creatorFlag = true;
      } else {
        result[recipientUid].orders[date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, true, false, recipientsArrUid);
      }
    }
    if (!creatorFlag) {
      if (!result[creatorUid]) {
        result[creatorUid] = {};
        result[creatorUid].orders = {};
        result[creatorUid].name = creator;
      }
      result[creatorUid].orders[date] = createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, recipientsArr.length, false, true, recipientsArrUid);
    }
  }
  return result;
}

function createRecord_(orderId, platform, type, mark, square, cameras, st, reviewST, cooperativ, recipientBoolean, creatorBoolean, recipientArray) {
  const result = {};
  result['orderId'] = orderId;
  result['platform'] = platform;
  result['type'] = type;
  result['mark'] = mark;
  result['square'] = square;
  result['cameras'] = cameras;
  result['st'] = st;
  result['reviewST'] = reviewST;
  result['cooperativ'] = cooperativ;
  result['recipient'] = recipientBoolean;
  result['creator'] = creatorBoolean;
  result['recipientArray'] = recipientArray;
  return result;
}

function addIfNotExist_(obj = {}) {
  return obj;
}
