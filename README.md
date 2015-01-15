#Clipboard
Clipboard is a personelle and training management system for Cadet units. Currently,it automates the activities of unit attendance, where cadets can be signed in at multiple sign-in points via the use of a mobile device (and with a barcode scanner). Unit staff can monitor attendance in real time, as well as generate reports after the fact to ensure error-free and timely data to be entered into FORTRESS.

In the future, Clipboard will be the hub for multiple aspects of administrating the cadet program, handling:
+   Uniform Marking (via Mobile Devices)
+   Achievements & Gamification (Points generated for attendance and uniforms)
+   Scheduling (Lessons and events. Notifications / Reminders sent to instructors)
+   Organization & Task Management (with the integration of Trello)

#Technologies Used
+   [Node.js](http://nodejs.org/)
+   [MongoDB](http://www.mongodb.org/)
+   [Mongoose](http://mongoosejs.com/)
+   [Express](http://expressjs.com/)
+   [Jquery](http://jquery.com/)
+   [Flat UI](http://designmodo.github.io/Flat-UI/)
+   [Bootstrap 3](http://getbootstrap.com/)

##What is (a) Clipboard?
A clipboard, is the usual symbol of an NCO (Non Comissioned Member, leader) within the Cadet program. They can be identified by metal clipboards carried in their left arm, usually containing all the tools and documents required to function in their leadership roles. Every clipboard, will usually contain the two following documents: attendance sheets, and uniform marking sheets.

##Why use Clipboard?
The aim of this project, is to digitize and automate that time-honoured leadership artifact, or at-least reduce the amount of paperwork and manual work required to handle unit attendance and personelle tracking.

Currently, weekly attendance, is a time-intensive manual process that takes time away from training and is usually inaccurate. Unit attendance is a crucial reporting requirement within the organization, as attendance determines the amount of resources allotted for future training years etc. This is time intensive because each cadet (or their staff) must find their name in a list of either 30 others, or 150 others dependent upon unit and sub-unit size. If done through a single sign-in point, this creates a bottleneck. If done by flight-staff, on average, 30 seconds is taken up per cadets for attendance. There are usually errors because members are signed-in manually using pen and paper, and because data must be re-entered manually.

Class attendance, is secondary roll call that is taken in each of the classes through-out the unit as a form of error checking. The Administration staff will check both attendance lists to ensure that a cadet was indeed present. However, if a cadet shows up on one and not the other, this creates issues.

If a cadet is going to be sick, they are currently told to inform their supervisors or call-in to the office. If either the supervisor or admin staff do not note the cadet down as excused (which is possible considering how busy staff are on a weekly/nightly basis), the cadet will be noted as “Absent Without Excuse” and will have his/her standings affected.

Clipboard will solve this problem in the following ways:
1.	It will automate and speed up the process by either allowing staff (either with a flight or at a single point) to take in attendance by either:
    +	scanning a cadets barcode (sewn into a uniform part)
    +	 allowing cadets to search for their name using a search box and quickly sign-in (using a tablet or computer).

2.	All attendance results will be contained in a single point (database) leading to less errors.
3.	Cadets that are sick, can e-mail into an automated inbox that will mark the cadet down as excused.
4.	When it’s time to enter the attendance into FORTRESS, results can be exported easily into an EXCEL file.


#START UP INSTRUCTIONS:
1. DATABASE PASSWORD: Add a file in the parent directory named: dbpassword.txt (I'll message you your db password)
2. Run NPM-INSTALL to install all required pl;ugins.
3. node ./bin/www
