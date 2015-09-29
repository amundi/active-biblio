Chapter 3: Measure Twice Cut Once: Upstream Prerequisites
=========================================================

Checklist: Requirements
-----------------------

The requirements checklist contains a list of questions to ask
yourself about your project's requirements.  This book doesn't tell
you how to do good requirements development, and the list won't tell
you how to do one either.  Use the list as a sanity check at
construction time to determine how solid the ground that you're
standing on is where you are on the requirements Richter scale.  Not
all of the checklist questions will apply to your project.  If you're
working on an informal project, you'll find some that you don't even
need to think about.  You'll find others that you need to think about
but don't need to answer formally.  If you're working on a large,
formal project, however, you may need to consider every one.

### Specific Functional Requirements

- Are all the inputs to the system specified, including their source,
  accuracy, range of values, and frequency?  
  
  	- Terminal app  
	External database to find books by isbn, to verify user's log (once by session)  
	
	- Command line interface / Web client  
	External database to find books by isbn, comments, likes, stars, notifications
	history, to verify user's log     

- Are all the outputs from the system specified, including their
  destination, accuracy, range of values, frequency, and format?
  
  - Terminal app  
	Send information (ID account, ISBN) to external database
	(GET/POST/PUT)  
	
	- Command line interface / Web client   
	Send information (ID account, ISBN) to external database 
	(GET/POST/PUT/DELETE)  

- Are all output formats specified for web pages, reports, and so on?

	- Terminal app  
	It will be a mobile application with only one page and a scan. All 
	actions are handled by popup.  
	
	- Web client  
	A web application with web pages (hmtl/css/bootstrap).  
	
	- Command line interface  
	All outputs will be textual.  
	
- Are all the external hardware and software interfaces specified?
	
	- Hardware : server, terminal, storage(database)
	- Software : web client, command line interface, mobile application

- Are all the external communication interfaces specified, including
  handshaking, error-checking, and communication protocols?
  
	See [webclient.md](docs/specs/webclient.md)    
	See [terminalapp.md](docs/specs/terminalapp.md)

- Are all the tasks the user wants to perform specified?  

	See [subsystems.md](docs/specs/subsystems.md)

- Is the data used in each task and the data resulting from each task
  specified?  
  
	See [usertask.md](docs/specs/usertask.md)

### Specific Non-Functional (Quality) Requirements

- Is the expected response time, from the user's point of view,
  specified for all necessary operations?  
  
	Immediate response

- Are other timing considerations specified, such as processing time,
  data-transfer rate, and system throughput?   
  
	NO

- Is the level of security specified?  

	2 kinds of user : Admin and user. Both have to login to use application.

- Is the reliability specified, including the consequences of software
  failure, the vital information that needs to be protected from
  failure, and the strategy for error detection and recovery?   
  
	If any software fail, the vital information is located in database.
	So, we just have to protect database from failure.

- Is maximum memory specified?  

	Negligible

- Is the maximum storage specified?   

	Negligible

- Is the maintainability of the system specified, including its
  ability to adapt to changes in specific functionality, changes in
  the operating environment, and changes in its interfaces with other
  software?   
  
	The software is designed to integrate the Amundi active framework.
	However, we tried to create a generic solution, a solution which can
	be used in another company.
 
- Is the definition of success included? Of failure?   

	The application is designed to handle books, reservation and 
	borrow. We also integrate social features like comments, likes.
	If user can use all features, it's a success.

### Requirements Quality

- Are the requirements written in the user's language? Do the users
  think so?  

- Does each requirement avoid conflicts with other requirements?    

- Are acceptable trade-offs between competing attributes specified—for
  example, between robustness and correctness?

- Do the requirements avoid specifying the design?

- Are the requirements at a fairly consistent level of detail? Should
  any requirement be specified in more detail? Should any requirement
  be specified in less detail?

- Are the requirements clear enough to be turned over to an
  independent group for construction and still be understood?

- Is each item relevant to the problem and its solution? Can each item
  be traced to its origin in the problem environment?

- Is each requirement testable? Will it be possible for independent
  testing to determine whether each requirement has been satisfied?

- Are all possible changes to the requirements specified, including
  the likelihood of each change?   
  
	See [subsystems.md](docs/specs/subsystems.md)  

### Requirements Completeness

- Where information isn't available before development begins, are the
  areas of incompleteness specified?   
  
	YES

- Are the requirements complete in the sense that if the product
  satisfies every requirement, it will be acceptable?  
  
	YES

- Are you comfortable with all the requirements? Have you eliminated
  requirements that are impossible to implement and included just to
  appease your customer or your boss?  
  
	YES


Checklist: Architecture
-----------------------

Here's a list of issues that a good architecture should address.  The
list isn't intended to be a comprehensive guide to architecture but to
be a pragmatic way of evaluating the nutritional content of what you
get at the programmer's end of the software food chain.  Use this
checklist as a starting point for your own checklist.

As with the requirements checklist, if you're working on an informal
project, you'll find some items that you don't even need to think
about.  If you're working on a larger project, most of the items will
be useful.

### Specific Architectural Topics

- Is the overall organization of the program clear, including a good
  architectural overview and justification?    
  
	See [subsystems.md](docs/specs/subsystems.md)  

- Are major building blocks well defined, including their areas of
  responsibility and their interfaces to other building blocks?    
  
	See [webclient.md](docs/specs/webclient.md)  

- Are all the functions listed in the requirements covered sensibly,
  by neither too many nor too few building blocks?   
  
	See [usertask.md](docs/specs/usertask.md)

- Are the most critical classes described and justified?   

	See [webclient.md](docs/specs/webclient.md)  

- Is the data design described and justified?   
 
	See [database.md](docs/specs/database.md)

- Is the database organization and content specified?  

	See [database.md](docs/specs/database.md)  

- Are all key business rules identified and their impact on the system
  described?   
  
	YES

- Is a strategy for the user interface design described?   

	See [webclient.md](docs/specs/webclient.md)   
	See [terminalapp.md](docs/specs/terminalapp.md) 

- Is the user interface modularized so that changes in it won't affect
  the rest of the program?   
  
	Yes, because we will use a REST API. See [rest.md](docs/specs/rest.md)

- Is a strategy for handling I/O described and justified?   

	See [rest.md](docs/specs/rest.md)

- Are resource-use estimates and a strategy for resource management
  described and justified?   
  
	We will use REST API linked with a database.

- Are the architecture's security requirements described?   

	- Connection :    
	All Amundi's employer can use the application. There is a special
	access for admin and they have more features on the application. To connect
	to the application, we check if email and password exist and if the account 
	is not locked. In fact, admin can lock an account on the application.
	
	- Security :    
	All SQL injection are called by the REST API. There are primary, foreign keys
	and some constraints on the column (not null, default, ...) to prevent duplication 
	or user fault and the api catches exception.    
	DDOS attacks ?? API/Server crash - no impact on DB

- Does the architecture set space and speed budgets for each class,
  subsystem, or functionality area?   
  
	It doesn't matter.

- Does the architecture describe how scalability will be achieved?   
	
	We try to implement a generic application. If we want to add a new
	feature, we have to create another table and manage the handling
	in the api.

- Does the architecture address interoperability?   

	The solution will be integrated in Amundi active framework.

- Is a strategy for internationalization/localization described?    

	We program a generic application which can easily reused in
	other company.

- Is a coherent error-handling strategy provided?   

	For SQL errors, we catch them in the API. For all users missuses,
	we handle them in front-end and show an error message.

- Is the approach to fault tolerance defined (if any is needed)?  

	There is a fault tolerance with sample-handling. In fact, there is
	a case where we loose the real location of a sample, it doesn't matter
	except in the case of someone want to recover his sample. It will be corrected
	by the "old-way", a person check which sample is the good one.

- Has technical feasibility of all parts of the system been
  established?    
  
	Not for all parts, but there is a POC for hardest parts.

- Is an approach to overengineering specified?  

	We think about features that we can't find a good way to
	implement it (notifications, register favorite quotation 
	for an account, ...)

- Are necessary buy-vs.-build decisions included?   

	Not really, most parts of the solution will be program. We will be
	reused the badge scanning system if it's possible.   

- Is the architecture designed to accommodate likely changes?    

	I think it will be easy to do some changes on user interfaces because
	there are linked to a REST API.

- Does the architecture describe how reused code will be made to
  conform to other architectural objectives?   
  
	To conform to other architectural objectives, we only need to
	check rest api links.

### General Architectural Quality

- Does the architecture account for all the requirements?   

	YES

- Is any part over- or under-architected? Are expectations in this
  area set out explicitly?
  
	ALL GOOD

- Does the whole architecture hang together conceptually?  

	YES

- Is the top-level design independent of the machine and language that
  will be used to implement it?   
  
	YES

- Are the motivations for all major decisions provided?   

	YES

- Are you, as a programmer who will implement the system, comfortable
  with the architecture?   
  
	YES


Checklist: Upstream Prerequisites
---------------------------------

- Have you identified the kind of software project you're working on
  and tailored your approach appropriately?   
  
	YES

- Are the requirements sufficiently well-defined and stable enough to
  begin construction (see the requirements checklist for details)?   
  
	YES

- Is the architecture sufficiently well defined to begin construction
  (see the architecture checklist for details)?   
  
	YES

- Have other risks unique to your particular project been addressed,
  such that construction is not exposed to more risk than necessary?   
  
	No risk.


Footnote
--------
This material is copied and/or adapted from the Code Complete 2
Website at cc2e.com. This material is Copyright (c) 1993-2004 Steven
C. McConnell. Permission is hereby given to copy, adapt, and
distribute this material as long as this notice is included on all
such materials and the materials are not sold, licensed, or otherwise
distributed for commercial gain.
