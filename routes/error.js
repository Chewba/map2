module.exports = function (app) {

 // url not found.
 app.use(function(req, res, next) {
  res.status = 404;
  if (req.accepts('html')){
   return res.send('<h2>Sorry. Page not found</h2>');
  };
  if (req.accepts('json')){
   return res.json({'error': 'Not found'});
  };
  res.type="txt";
  res.send('Page not found');
 });
 
 // app error
 app.use(function (err, req, res, next){
  console.error('error at %s\n', req.url, err);
  res.send('Page error!');
 });
};