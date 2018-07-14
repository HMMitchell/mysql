var express = require('express');
var mysql = require("mysql");
var template = require("art-template");
let path = require("path");
let multiparty = require("multiparty");
var app = express();
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'test'
});

connection.connect();

app.use(express.static("www"));
// get方法 查询功能
app.get('/index', function (req, res) {
  //  res.send('you come');
  // console.log(req);
  // 利用get搜索功能
  let search = req.query.search;
  let sql = search ? `select*from manyhero where name like '%${search}%' order by id desc` : "select*from manyhero order by id desc"
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    var html = template(path.join(__dirname, "tem/index.html"), {
      results,
      search
    });
    res.send(html);
  });
});
// get 删除功能
app.get('/delete', (req, res) => {
  //  res.send('过来了')
  let sql = `delete from manyhero where id =${req.query.id}`;
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    console.log(results);
    // results.affectedRows影响的行数
    if (results.affectedRows != 0) {
      res.redirect("/index");
    }
  });
});
// post 增加功能
app.post('/add', (req, res) => {
  //  res.send('过来了')
  var form = new multiparty.Form({
    uploadDir: path.join(__dirname, "www/upload")
  });

  form.parse(req, function (err, fields, files) {
    // console.log(fields);
    // console.log(files);
    let name = fields.name[0];
    let icon = path.basename(files.icon[0].path)
    // console.log(icon);
    let sql = `insert into manyhero(name,icon) values ('${name}','upload/${icon}')`
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      res.redirect("/index");
    });
  });
});

// 更改功能 先渲染
app.get('/update', (req, res) => {
  //  res.send('过来了')
  // console.log(req);
  let id = req.query.id;
  let sql = `select*from manyhero where id=${id};`
  connection.query(sql, function (error, results, fields) {
    if (error) throw error;
    var html = template(path.join(__dirname, "tem/update.html"), {
      results,
      // search
    });
    // console.log(results);
    res.send(html);
  });
  // 更改功能 提交后更改
  app.post('/update', (req, res) => {
    //  res.send('过来了')
    var form = new multiparty.Form({
      uploadDir: path.join(__dirname, "www/upload")
    });

    form.parse(req, function (err, fields, files) {
      // console.log(fields);
      // console.log(files);
      let name = fields.name[0];
      let icon = path.basename(files.icon[0].path)
      // console.log(icon);
      let sql = `update manyhero set name='${name}',icon='upload/${icon}' where id=${fields.id[0]}`
      connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.redirect("/index");
      });
    });
  })
})
// 开启监听
app.listen(80, function () {
  console.log('监听 success');
});