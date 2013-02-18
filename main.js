var commentModel = Backbone.Model.extend({});
var commentCollection = Backbone.Collection.extend({
  initialize: function() {
    this.sort_order = -1;
    this.sort_field = 'index';
  },
  // Sort by level then sort by the sort field
  // Increasing the magnitude of level to be greater then that of the sort field (notibly the timestamp)
  comparator: function(comment) {
    return (comment.get('level') + 1) * 10000000000000 + this.sort_order * comment.get(this.sort_field);
  },
  model: commentModel
});

var comments = new commentCollection();

// Using insertAfter to arrange the comments based on their sort order, maintain nesting
// insertAfter reverses the order, so sort_order in the collection is flipped
var updatePage = function() {
  comments.each(function(comment) {
    comment.get('element').insertAfter(comment.get('parentelement'));
  });
};

var commentroot = '<tr id="commentroot"><td class="comhead">Sort: <a href="#" id="sortDateAsc">Newest First</a> | <a href="#" id="sortDateDesc">Oldest First</a> | <a href="#" id="sortOriginal">Original</a></td></tr>';
$(function() {
  $(".default:first").parents("tr:eq(1)").before(commentroot);
  $("#sortDateAsc").click(function(event) {
    event.preventDefault();
    comments.sort_order = 1;
    comments.sort_field = 'timestamp';
    comments.sort();
    updatePage();
    return false;
  });
  $("#sortDateDesc").click(function(event) {
    event.preventDefault();
    comments.sort_order = -1;
    comments.sort_field = 'timestamp';
    comments.sort();
    updatePage();
    return false;
  });
  $("#sortOriginal").click(function(event) {
    event.preventDefault();
    comments.sort_order = -1;
    comments.sort_field = 'index';
    comments.sort();
    updatePage();
    return false;
  });
  var now = new Date();
  var parents = new Array($("#commentroot"));
  $(".default").each(function(index) {
    var then = new Date();
    var level = Math.floor($(this).parent('tr').find('img')[0].width / 40);
    var element = $(this).parents("tr:eq(1)");
    parents[level+1] = element;

    // username time timetype ago
    // timetype: minute minutes hour hours day days
    var comhead = $(".comhead", this).text().split(" ");
    if(comhead[2].indexOf('minute') != -1) {
      then.setMinutes(now.getMinutes() - comhead[1]);
    } else if(comhead[2].indexOf('hour') != -1) {
      then.setHours(now.getHours() - comhead[1]);
    } else if(comhead[2].indexOf('day') != -1) {
      then.setDate(now.getDate() - comhead[1]);
    }

    // Index/level for original order, parentelement to maintain nesting, element to move comment
    comments.add({
      index: index,
      level: level,
      timestamp: then.getTime(),
      parentelement: parents[level],
      element: element
    });
  });
});