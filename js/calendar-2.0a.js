//
// JavaScript Event Calendar
//
// Version: 2.0a
// Date: January 18, 2010
// For information: http:/calendar.ilsen.net  or kevin@ilsen.net
//
var JEC = function() {
  
  // Configurable values are set to defaults here; can override them before calling Calendar( ) from the HTML page

  var _specialDay = 1; // 1=Sunday, 2=Monday, . . . 7=Saturday
  var _fontSize = 5;
  var _colorBackground = "#ffffcc";
  var _colorSpecialDay = "red";
  var _colorToday = "green";
  var _colorEvent = "blue";

  // Utility function that fixes a Netscape 2 and 3 bug
  var _getFullYear = function(d) { // d is a date object
    var yr = d.getYear();
    if (yr < 1000)
      yr += 1900;
    return yr;
  };

  // Initialize the range of the calendar to Jan - Dec of the current year.  Defined events will change this
  // as needed; it is also possible to explicitly override the range before showing the calendar.

  var _today = new Date();
  var _firstMonth = _getFullYear(_today) * 100 + 1;
  var _lastMonth = _firstMonth + 11;

  // events[] is a SPARSE array
  var _events = new Array;  

  // Utility function to populate an array with values
  var _arr = function() {
    for (var n=0;n<arguments.length;n++) {
      this[n+1] = arguments[n];
    }
  };
  
  // Create the array of month names (used in various places)
  var _months = new _arr("January","February","March","April","May","June","July","August","September","October","November","December");

  var _numDaysIn = function(mo,yr) {
    if (mo==4 || mo==6 || mo==9 || mo==11) return 30;
    else if ((mo==2) && _leapYear(yr)) return 29;
    else if (mo==2) return 28;
    else return 31;
  };

  var _leapYear = function(yr) {
    if (((yr % 4 == 0) && yr % 100 != 0) || yr % 400 == 0) return true;
    else return false;
  };

  var _prevMonth = function(mth) {
    if (mth == 1) return 12;
    else return (mth-1);
  };

  var _nextMonth = function(mth) {
    if (mth == 12) return 1;
    else return (mth+1);
  };

  var _prevYearMonth = function(yrmth) {
    if ((yrmth % 100) == 1) return ((yrmth-100)+11);
    else return (yrmth-1);
  };

  var _nextYearMonth = function(yrmth) {
    if ((yrmth % 100) == 12) return ((yrmth-11)+100);
    else return (yrmth+1);
  };

  _jumpTo = function(calendar, thispage) {
    var sel, yrmo;

    sel = calendar.selectedIndex;
    yrmo = calendar.form.jumpmonth[sel].value;
    document.location = thispage + "?" + yrmo;
  };

  var _buildSelectionList = function(current,thispage) {
    var mo, yr, yearmonth;

    yearmonth = _firstMonth;
    document.write("<select name=\"jumpmonth\" size=1 onchange=\"_jumpTo(this,'" + thispage + "')\">");
    while (yearmonth <= _lastMonth) {
      mo = yearmonth % 100;
      yr = (yearmonth - mo) / 100;
      document.write("<option value=");
      document.write(yearmonth);
      if (yearmonth == current) document.write(" selected");
      document.write(">");
      document.write(_months[mo]+" "+yr);
      yearmonth = _nextYearMonth(yearmonth);
    }
    document.write("</select>");
  };

  // Display a date in the appropriate color, with events (if there are any)
  var _showDate = function(yr, mo, dy, dayofweek, currentmonth, currentday) {
    var ind, highlightEvent, tmp;

    document.write("<TD ALIGN=CENTER VALIGN=TOP><P ALIGN=RIGHT><FONT SIZE="+_fontSize);
    highlightEvent = true;
    if (dayofweek == _specialDay) {
      document.write(" COLOR=" + _colorSpecialDay);
      highlightEvent = false;
    }
    if ((mo == currentmonth) && (dy == currentday)) {
      document.write(" COLOR=" + _colorToday);
      highlightEvent = false;
    }
    ind = (((yr * 100) + mo) * 100) + dy;
    if (_events[ind]) {
      tmp = _events[ind];
      if (highlightEvent) {
         document.write(" COLOR=" + _colorEvent);
      }
    } else tmp="&nbsp;<BR>&nbsp;";
    document.write("><B>"+dy+"</B></ALIGN></FONT></P><FONT SIZE=1>"+tmp+"</TD>");
  };

  return {
    
    // Each event is defined by calling the defineEvent( ) routine with the following parameters:
    //
    //   defineEvent(EventDate, EventDescription, EventLink, Image, Width, Height)
    //        EventDate is a numeric value in the format YYYYMMDD
    //        EvenDescription is a string that can include embedded HTML tags (e.g., <BR>, <strong>, etc.)
    //        EventLink is the URL of the target page if a hyperlink is desired from this event entry
    //        Image is the URL of the image if you want to display an image with this event
    //        Width is the width of the image in pixels
    //        Height is the height of the image in pixels
    
    defineEvent: function(eventDate, eventDescription, eventLink, image, width, height) {
    	var tmp;
    
    	// Build the HTML string for this event: image (optional), link (optional), and description
    	tmp = "";
    	if (image != "")
    		tmp = tmp + '<img src="' + image + '"  width="' + width + '" height="' + height + '" align="left" valign="top">';
    	if (eventLink != "")
    		tmp = tmp + '<a href="' + eventLink + '">';
    	tmp = tmp + eventDescription;
    	if (eventLink != "") tmp = tmp + '</a>';
    
    	// If an event already exists for this date, append the new event to it.
    	if (_events[eventDate])
    		_events[eventDate] += "<BR>" + tmp;
    	else
    		_events[eventDate] = tmp;
    
    	// Adjust the minimum and maximum month & year to include this date
    	tmp = Math.floor(eventDate / 100);
    	if (tmp < _firstMonth) _firstMonth = tmp;
    	if (tmp > _lastMonth) _lastMonth = tmp;
    },
    
    // Calendar( ) is the only routine that needs to be called to display the calendar

    showCalendar: function() {
      var curdy, curmo, yr, mo, dy, dayofweek, yearmonth, bgn, lastday, jump;
      var weekdays = new _arr("Sun","Mon","Tue","Wed","Thu","Fri","Sat");
      var thispage = window.location.pathname;

      // Save current day and month for comparison
      curdy = _today.getDate();
      curmo = _today.getMonth()+1;

      // Default to current month and year
      mo = curmo;
      yr = _getFullYear(_today);
      yearmonth = (yr * 100) + mo;

      // If querystring parameter is present, get the month/year ("calendar.htm?YYYYMM")
      if (location.search.length > 1) {
        yearmonth = parseInt(location.search.substring(1,location.search.length));
        if ((""+yearmonth).length == 6) {
          mo = yearmonth % 100;
          yr = (yearmonth - mo) / 100;
        }
      }

      // Constrain to the range of months with events
      if (yearmonth < _firstMonth) {
        mo = _firstMonth % 100;
        yr = (_firstMonth - mo) / 100;
        yearmonth = _firstMonth;
      }
      if (yearmonth > _lastMonth) {
        mo = _lastMonth % 100;
        yr = (_lastMonth - mo) / 100;
        yearmonth = _lastMonth;
      }

      // Create a date object for the first day of the desired month
      bgn = new Date(_months[mo] + " 1," + yr);
      // Get the day-of-week of the first day, and the # days in the month
      dayofweek = bgn.getDay();
      lastday = _numDaysIn(mo,yr);
      document.write("<TABLE BORDER=2 BGCOLOR="+_colorBackground+"><TR><TD ALIGN=CENTER COLSPAN=7><FONT SIZE="+_fontSize+"><B>"+_months[mo]+" "+yr+"</B></FONT></TD></TR><TR>");
      for (var i=1;i<=7;i++){
        document.write("<TD ALIGN=CENTER WIDTH=14%><FONT SIZE=1>"+weekdays[i]+"</FONT></TD>");
      }
      document.write("</TR><TR>");
      dy = 1;
      // Special handling for the first week of the month
      for (var i=1;i<=7;i++) {
        // If the day is less than the day of the
        // week determined to be the first day
        // of the month, print a space in
        // this cell of the table.
        if (i <= dayofweek){
          document.write("<TD ALIGN=CENTER><FONT SIZE="+_fontSize+">&nbsp;</FONT></TD>");
        }
        // Otherwise, write date and the event,
        // if any, in this cell of the table.
        else {
          _showDate(yr,mo,dy,i,curmo,curdy);
          dy++;
        }
      }
      document.write("</TR><TR>");
      // Rest of the weeks . . .
      while (dy <= lastday) {
        for (var i=1;i<=7;i++) {
          // If the day is greater than the last
          // day of the month, print a space in
          // this cell of the table.
          if (dy > lastday) {
            document.write("<TD ALIGN=CENTER>&nbsp;</TD>");
          }
          // Otherwise, write date and the event,
          // if any, in this cell of the table.
          else {
            _showDate(yr,mo,dy,i,curmo,curdy);
            dy++;
          }
        }
        document.write("</TR><TR>");
      }

      jump = "";
      if (yearmonth > _firstMonth)
        jump += '<a href="' + thispage + '?'+_prevYearMonth(yearmonth)+'">&lt;-- View '+_months[_prevMonth(mo)]+'</a>';
      if ((yearmonth > _firstMonth) && (yearmonth < _lastMonth))
        jump += " &nbsp; | &nbsp; ";
      if (yearmonth < _lastMonth)
        jump += '<a href="' + thispage + '?'+_nextYearMonth(yearmonth)+'">View '+_months[_nextMonth(mo)]+' --&gt;</a>';
      document.write("</TR><TR><TD colspan=7 align=center>"+jump+"</TD></TR>");
      document.write("<TR><TD colspan=7 align=center valign=middle><FORM>Jump to month:&nbsp;&nbsp;");
      _buildSelectionList(yearmonth, thispage);
      document.write("</FORM></TD></TR></TABLE>");
    }

  };
  
};




