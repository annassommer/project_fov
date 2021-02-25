const express = require('express')
const fetch = require("node-fetch");
const ssml = require('ssml');
const app = express()
const port = 3000

var ssmlDoc = new ssml({language: 'de-DE'});


app.get('/', (req, res) => {
  res.send('Hello Anna!')
})

app.get('/wetter', (req, res) => {
    var stadt = req.param('stadt');
    var tag = req.param('tag')
    var maß = req.param('maß')
    var url = 'http://api.openweathermap.org/data/2.5/';

    // set metric system
    if(maß != 'Fahrenheit') {
        maß = 'metric';
    } else {
        maß = 'imperial';
    }

    // set which API to use
    if( typeof tag === "undefined") {
        url += 'weather';
    } else {
        url += 'forecast';
    }

    // connect with API
    fetch(url+'?q='+stadt+'&appid=32d454a1293ca7919a2b7ccd0f2afbc8&units='+maß)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        var temp;
        var dayString;
        // wether it is weather today or weather forecast
        if(typeof tag === "undefined") {

            temp = data['main']['temp'];
            dayString = "heute"

        } else {
            temp = getData(data, tag);
            thisdate = new Date();
            thisdate.setDate(thisdate.getDate()+parseInt(tag));
            dayString = getDay(thisdate.getDay())
        }

        // ssml annotations
        ssmlDoc.say('In ' + stadt + ' sind heute')
        .break(300)
        .say('' + temp)
        .break(300)
        .say('Grad.')
        .toString({pretty: true});

        res.json({
            "ergebnis": 'In ' + stadt + ' sind ' + dayString + ' ' + temp + ' Grad.'
        })
      })
    .catch((err) => {
        res.send(err)
    })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// filter for Data in forecast
function getData(data, tag) {

    // get correct date, which is filtered for
    thisdate = new Date();
    thisdate.setDate(thisdate.getDate()+parseInt(tag));
    thisdate.setHours(13, 00, 00, 00);

    thisdate = thisdate.getTime();

    // filter for date
    data = data['list'].filter(function(list){
        if(list.dt+'000' == thisdate){
            return list;
        }
    });
    
    
    return data[0]['main']['temp_max'];
}

function getDay(day) {
    console.log(day);
    var weekday = new Array(7);
    weekday[0] = "Sonntag";
    weekday[1] = "Montag";
    weekday[2] = "Dienstag";
    weekday[3] = "Mittwoch";
    weekday[4] = "Donnerstag";
    weekday[5] = "Freitag";
    weekday[6] = "Samstag";

    return weekday[day];

}