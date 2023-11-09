const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000
const fs = require('fs')
const fileName = 'data.json'
const data = fs.readFileSync(fileName);
let longLink = ''
let words = ''

app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false })); //解析POST請求

app.get('/', (req, res) => {
  res.render('index')
})

app.post('/shorten', (req, res) => {
  longLink = req.body.url
  shorten(longLink)
  res.render('shorten', { words })
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/:words', (req, res) => {
  const { words } = req.params;
  let searchData = JSON.parse(data)
  for (let x = 0; x < searchData.length; x++) {
    let stringSearchWord = (JSON.stringify(Object.values(searchData[x])))
    modifiedWord = stringSearchWord.replace(/\["(.*)"\]/, '$1')

    console.log(modifiedWord)
    if (modifiedWord === words) {
      console.log('match  word', modifiedWord)
      let stringSearchLong = (JSON.stringify(Object.keys(searchData[x])))
      modifiedLong = stringSearchLong.replace(/\["(.*)"\]/, '$1')
      res.redirect(modifiedLong);
    }
    else {
      res.status(404).send('No matched website')
    }
  }


})

function shorten(longLink) {

  let oldData = '';
  let saveData = [];

  if (longLink.slice(-1) != '/') {
    longLink += '/';
  }

  try {
    if (data.length) {
      oldData = JSON.parse(data);
      for (let x = 0; x < oldData.length; x++) {
        if (`["${longLink}"]` === JSON.stringify(Object.keys(oldData[x]))) {
          stringWords = JSON.stringify(Object.values(oldData[x]));
          words = stringWords.replace(/\["(.*)"\]/, '$1')
          return words;
        }
      }
      saveData = oldData;
    }

    randGen();
    const newData = {
      [longLink]: words
    };
    saveData.push(newData);
    saveData = JSON.stringify(saveData);

    fs.writeFileSync(fileName, saveData);

    return words;

  } catch (err) {
    console.error('Error while reading or writing file:', err);
  }
}

function randGen() {
  words = ''
  alltext = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (let i = 0; i < 5; i++) {
    let randNum = Math.floor(Math.random() * 61 + 1)
    let bingoNum = alltext[randNum]
    words += bingoNum
  }
  return words;

}
