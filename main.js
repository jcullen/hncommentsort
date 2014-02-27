$(function() {
  var now = new Date();
  var max_depth = 0;
  var comment_holder = $('.default:first').parents('tbody:eq(1)');
  var comments = comment_holder.children().has('font').get();
  // Maintain a heirarchy of comments
  var heirarchy = [];
  var depth = 0;
  var comhead;
  var then;

  heirarchy[0] = comment_holder;

  // Load sort-options html onto page
  $.get(chrome.extension.getURL('/sort-options.html'), function(data) {
    comment_holder.parent().prepend(data);
  });

  // Process comments to determine heirarchy and parse timestamp for sorting
  for (var i = 0; i < comments.length; i++) {
    // comhead data format: username time timetype ago
    // possible timetypes: minute minutes hour hours day days
    comhead = $('.comhead', comments[i]).text().split(' ');
    then = new Date();
    // Comment depth is determined by the comments identation, identation is done through an image
    depth = Math.floor($(comments[i]).find('img')[0].width / 40);
    heirarchy[depth+1] = comments[i];

    if (depth > max_depth) { max_depth = depth; }

    if (comhead[2].indexOf('minute') != -1) {
      then.setMinutes(now.getMinutes() - comhead[1]);
    } else if (comhead[2].indexOf('hour') != -1) {
      then.setHours(now.getHours() - comhead[1]);
    } else if (comhead[2].indexOf('day') != -1) {
      then.setDate(now.getDate() - comhead[1]);
    }

    $.data(comments[i], 'date', then);
    $.data(comments[i], 'depth', depth);
    $.data(comments[i], 'original_index', i);
    $.data(comments[i], 'parent', heirarchy[depth]);
  }

  $(document).on('click', '#sort-date-asc', function(event) {
    event.preventDefault();
    sortDate(false);
    return false;
  });

  $(document).on('click', '#sort-date-desc', function(event) {
    event.preventDefault();
    sortDate(true);
    return false;
  });

  $(document).on('click', '#sort-original', function(event) {
    event.preventDefault();
    comments.mergeSort(function(a, b) {
      if ($.data(a, 'original_index') > $.data(b, 'original_index')) { return 1; }
      return -1;
    });
    for (var x = 0; x < comments.length; x++) {
      $(comment_holder).append(comments[x]);
    }
   return false;
  });

  function sortDate(reverse) {
    var subset;
    var reverse = reverse || false;
    // Date Sort: Sort by date then insert each comment after its parent to maintain the heirarchy
    // Using mergeSort library for stable sorting
    comments.mergeSort(function(a, b) {
      if ($.data(a, 'date') > $.data(b, 'date')) { return 1; }
      return -1;
    });
    if(reverse) comments.reverse();
    for (var i = 0; i <= max_depth; i++) {
      subset = comments.filter(function(item) {
        return $.data(item, 'depth') === i;
      });
      for (var x = 0; x < subset.length; x++) {
        if($.data(subset[x], 'depth') === 0) {
          $(comment_holder).prepend(subset[x]);
        } else {
          $($.data(subset[x], 'parent')).after(subset[x]);  
        }
      }
    }
  }
});