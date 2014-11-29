define([], function() {
  'use strict';
  var selectors = {
  };
  var html = {
    postTemplate : '<div class="post">\
                      <hr width="50%">\
                      <h2 class="title"></h2>\
                      <div class="content">\
                      </div>\
                    </div>',
    postThoughtTemplate :  '<div class="thought">\
                              <p></p>\
                            </div>'
  };
  var keys = {
    scrollLeft : "scroll left",
    scrollRight : "scroll right"
  };
  var pages = {
    present : "present",
    past : "past",
    future : "future"
  }
  var specs = {
  };
  var current = {
    page : pages.present
  }
  return {
  	selectors : selectors,
  	html : html,
  	keys : keys,
    pages : pages,
    current : current,
    specs : specs
  };
});
