
function test() {
  data = [
    [],
    [],
    [0, 1, 2, 3, 4],
    [0, 1],
    [0, 1, 2, 3, 4, 5],
    [2, 3, 4],
    [],
    [1]
  ];
  processData(data);

}

function processDataTest(data) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Test Feedback');
  sheet.clear();
  let width = 1;
  for (const row of data) if (row.length > width) width = row.length;
  let values = data.filter(row => row.length);//removing empty strings
  values = values.map((row, rowIndex) => {
    if (rowIndex > 0) row[0] = floatToDate(row[0]);
    if (row.length < width) {
      if (!row.length) return;
      for (let i = row.length; i < width; i++) {
        row[i] = '';
      }
    }
    return row;
  })
  sheet.getRange(1, 1, values.length, width).setValues(values);
  SpreadsheetApp.getUi().alert("Тестовый файл загружен");
  return
};

function processDataLive(data) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName('Live Feedback');
  sheet.clear();
  let width = 1;
  for (const row of data) if (row.length > width) width = row.length;
  let values = data.filter(row => row.length);
  values = values.map((row, rowIndex) => {
    if (rowIndex > 0) row[0] = floatToDate(row[0]);
    if (row.length < width) {
      if (!row.length) return;
      for (let i = row.length; i < width; i++) {
        row[i] = '';
      }
    }
    return row;
  })
  sheet.getRange(1, 1, values.length, width).setValues(values);
  SpreadsheetApp.getUi().alert("Живой файл загружен")
  return
};

function showModalWindow() {
  var template = HtmlService.createTemplateFromFile('modalWindowHTML.html');
  // template.data2 = getTeamNames(r_sheets.sheetNameMonth);
  var htmlOutput = template.evaluate();
  htmlOutput//.setTitle('Load  Your File')
    .setWidth(300)
    .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Load  Your Files');
}

function floatToDate(oldDate) {
  return new Date(Math.round((oldDate - 25569) * 86400 * 1000));
}

