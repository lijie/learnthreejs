
const express = require('express')
const app = express()
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use('/ch1_load_model/', express.static(__dirname + '/ch1_load_model'))
app.use('/ch2_add_light/', express.static(__dirname + '/ch2_add_light'))
app.use('/ch4_toon/', express.static(__dirname + '/ch4_toon'))
app.use('/build/', express.static(path.join(__dirname, '/node_modules/three/build')));
app.use('/jsm/', express.static(path.join(__dirname, '/node_modules/three/examples/jsm')));
app.use('/models/', express.static(__dirname + '/models'))
app.use('/node_modules/', express.static(__dirname + '/node_modules'))

app.listen(8001, () =>
  console.log('Visit http://127.0.0.1:8001')
);
