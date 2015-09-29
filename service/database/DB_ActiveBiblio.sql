CREATE DATABASE IF NOT EXISTS activebiblio DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE activebiblio;

-- DATA TABLES
CREATE TABLE IF NOT EXISTS Location(
	id int unsigned NOT NULL AUTO_INCREMENT,
	building varchar(100) NOT NULL,
	floor int unsigned NOT NULL,
	room varchar(100) NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (building, floor, room)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS VoteType(
	id int unsigned NOT NULL AUTO_INCREMENT,
	name varchar(100) NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- TABLES
CREATE TABLE IF NOT EXISTS Account (
	id int unsigned NOT NULL AUTO_INCREMENT,
	email varchar(255) NOT NULL,
	type varchar(50) NOT NULL DEFAULT 'User',
	state varchar(50) NOT NULL DEFAULT 'Available',
	last_login_date timestamp DEFAULT NULL,

	PRIMARY KEY (id)	
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

CREATE TABLE IF NOT EXISTS Book (
	id int unsigned NOT NULL AUTO_INCREMENT,
	isbn10 varchar(10) NOT NULL,
	isbn13 varchar(13) NOT NULL,
	title varchar(255) NOT NULL,
	publisher varchar(255) DEFAULT NULL,
	published_date Year NOT NULL,
	language varchar(50) NOT NULL,
	description text(4096) DEFAULT NULL,
	pages int NOT NULL,
	photo text(2048) DEFAULT NULL,
	borrow_days_limit int NOT NULL,

	PRIMARY KEY (id),
	UNIQUE (isbn10),
	UNIQUE (isbn13)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS Author (
	id int unsigned NOT NULL AUTO_INCREMENT,
	book_id int unsigned NOT NULL,
	name varchar(100) NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
	UNIQUE (book_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS Category (
	id int unsigned NOT NULL AUTO_INCREMENT,
	book_id int unsigned NOT NULL,
	name varchar(100) NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
	UNIQUE (book_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS Hardcopy (
	id int unsigned NOT NULL AUTO_INCREMENT,
	book_id int unsigned NOT NULL,
	account_id int unsigned NOT NULL,
	location_id int unsigned DEFAULT NULL,
	state varchar(50) NOT NULL DEFAULT 'Available',
	added_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
	FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
	FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
	FOREIGN KEY (location_id) REFERENCES Location(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS Borrow (
	id int unsigned NOT NULL AUTO_INCREMENT,
	account_id int unsigned NOT NULL,
	hardcopy_id int unsigned,
	book_id int unsigned NOT NULL,
	borrow_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	return_date timestamp DEFAULT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
	FOREIGN KEY (hardcopy_id) REFERENCES Hardcopy(id) ON DELETE CASCADE,
	FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS Reservation (
	id int unsigned NOT NULL AUTO_INCREMENT,
	book_id int unsigned DEFAULT NULL,
	account_id int unsigned NOT NULL,
	reservation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	reservation_deadline timestamp DEFAULT NULL,
	queue_order int NOT NULL,
	reservation_hardcopy_id int unsigned DEFAULT NULL,
	reservation_hardcopy_location_id int unsigned DEFAULT NULL,

	PRIMARY KEY (id),
	FOREIGN KEY (book_id) REFERENCES Book(id) ON DELETE CASCADE,
	FOREIGN KEY (account_id) REFERENCES Account(id) ON DELETE CASCADE,
	FOREIGN KEY (reservation_hardcopy_id) REFERENCES Hardcopy(id) ON DELETE CASCADE,
	FOREIGN KEY (reservation_hardcopy_location_id) REFERENCES Location(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS Rate (
	id int(10) unsigned NOT NULL AUTO_INCREMENT,
	account_id int unsigned NOT NULL,
	book_id int unsigned NOT NULL,
	mark int unsigned,
	
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
	FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
	UNIQUE (account_id,book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS Vote (
	id int unsigned NOT NULL AUTO_INCREMENT,
	account_id int unsigned NOT NULL,
	book_id int unsigned NOT NULL,
	votetype_id int unsigned NOT NULL,
	added_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (id),
    FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE,
    FOREIGN KEY (votetype_id) REFERENCES VoteType (id) ON DELETE CASCADE,
    UNIQUE (account_id, book_id, votetype_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS Comment (
	id int unsigned NOT NULL AUTO_INCREMENT,
	account_id int unsigned NOT NULL,
	book_id int unsigned NOT NULL,
	comment_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	comment_text text(4096) NOT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
	FOREIGN KEY (book_id) REFERENCES Book (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

CREATE TABLE IF NOT EXISTS Reputation (
	id int unsigned NOT NULL AUTO_INCREMENT,
	account_id int unsigned NOT NULL,
	score int(10) unsigned,
	
	PRIMARY KEY (id),
	FOREIGN KEY (account_id) REFERENCES Account (id) ON DELETE CASCADE,
	UNIQUE (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- INSERT
INSERT INTO VoteType (id, name) VALUES
(1, 'Like'),
(2, 'Favorite');

INSERT INTO Location (id, building, floor, room) VALUES
(1, 'Building', 1, 'J45'),
(2, 'Building', 1, 'E23'),
(3, 'Building', 16, 'J91');

INSERT INTO Book (id, isbn10, isbn13, title, publisher, published_date, language,
description, pages, photo, borrow_days_limit) VALUES
(1, '0201633612', '9780201633610', 'Design Patterns', 'Addison-Wesley', 1995, 'en', 'Capturing a wealth of experience about the design of object-oriented software, \nfour top-notch designers present a catalog of simple and succinct solutions to commonly occurring \ndesign problems. Previously undocumented, these 23 patterns allow designers to create more flexible, \nelegant, and ultimately reusable designs without having to rediscover the design solutions themselves. \nThe authors begin by describing what patterns are and how they can help you design object-oriented \nsoftware. They then go on to systematically name, explain, evaluate, and catalog recurring designs in \nobject-oriented systems. With Design Patterns as your guide, you will learn how these important patterns \nfit into the software development process, and how you can leverage them to solve your own design problems\n most efficiently. Each pattern describes the circumstances in which it is applicable, when it can be \n applied in view of other design constraints, and the consequences and trade-offs of using the pattern \n within a larger design. All patterns are compiled from real systems and are based on real-world examples.\n Each pattern also includes code that demonstrates how it may be implemented in object-oriented \n programming languages like C++ or Smalltalk. 0201633612B07092001', 395, 'http://images.pearsoned-ema.com/jpeg/large/9780201633610.jpg', 7),
(2, '1593271441', '9781593271442', 'Hacking: The Art of Exploitation', 'No Starch Press; 2nd edition', 2008, 'English', 'Hacking is the art of creative problem solving, whether that means finding an unconventional solution to a difficult problem or exploiting holes in sloppy programming. Many people call themselves hackers, but few have the strong technical foundation needed to really push the envelope.\r\n\r\nRather than merely showing how to run existing exploits, author Jon Erickson explains how arcane hacking techniques actually work. To share the art and science of hacking in a way that is accessible to everyone, Hacking: The Art of Exploitation, 2nd Edition introduces the fundamentals of C programming from a hacker’s perspective.\r\n\r\nThe included LiveCD provides a complete Linux programming and debugging environment-all without modifying your current operating system. Use it to follow along with the book’s examples as you fill gaps in your knowledge and explore hacking techniques on your own. Get your hands dirty debugging code, overflowing buffers, hijacking network communications, bypassing protections, exploiting cryptographic weaknesses, and perhaps even inventing new exploits.', 488, 'http://ecx.images-amazon.com/images/I/61XTb78EclL._SX377_BO1,204,203,200_.jpg', 7),
(3, '0132350882', '9780132350884', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Prentice Hall; 1 edition', 2008, 'English', 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn’t have to be that way.\r\n\r\nNoted software expert Robert C. Martin presents a revolutionary paradigm with Clean Code: A Handbook of Agile Software Craftsmanship . Martin has teamed up with his colleagues from Object Mentor to distill their best agile practice of cleaning code “on the fly” into a book that will instill within you the values of a software craftsman and make you a better programmer—but only if you work at it.\r\n\r\nWhat kind of work will you be doing? You’ll be reading code—lots of code. And you will be challenged to think about what’s right about that code, and what’s wrong with it. More importantly, you will be challenged to reassess your professional values and your commitment to your craft.', 464, 'http://ecx.images-amazon.com/images/I/51oXyW8WQwL._SX387_BO1,204,203,200_.jpg', 7),
(4, '0735619670', '9780735619678', 'Code Complete: A Practical Handbook of Software Construction, Second Edition', 'Microsoft Press; 2nd edition', 2004, 'English', 'Widely considered one of the best practical guides to programming, Steve McConnell’s original CODE COMPLETE has been helping developers write better software for more than a decade. Now this classic book has been fully updated and revised with leading-edge practices—and hundreds of new code samples—illustrating the art and science of software construction. Capturing the body of knowledge available from research, academia, and everyday commercial practice, McConnell synthesizes the most effective techniques and must-know principles into clear, pragmatic guidance. No matter what your experience level, development environment, or project size, this book will inform and stimulate your thinking—and help you build the highest quality code', 960, 'http://ecx.images-amazon.com/images/I/515iO%2B-PRUL._SX408_BO1,204,203,200_.jpg', 7),
(5, '1593275439', '9781593275433', 'Learn to Program with Scratch', ' No Starch Press', 2014, 'English', 'Scratch is a fun, free, beginner-friendly programming environment where you connect blocks of code to build programs. While most famously used to introduce kids to programming, Scratch can make computer science approachable for people of any age. Rather than type countless lines of code in a cryptic programming language, why not use colorful command blocks and cartoon sprites to create powerful scripts?', 288, 'http://ecx.images-amazon.com/images/I/51DP7leWj%2BL._SX376_BO1,204,203,200_.jpg', 7),
(6, '2215088877', '9782215088875', 'Le pot ça sert à quoi ?', 'Publisher', 2000, 'French', 'Madi, le petit lionceau, n''aime pas avoir sa couche mouillée. Mais le pot, il ne sait pas à quoi ça sert. Ses amis vont lui expliquer et Madi sera fier d''aller sur le pot comme un grand.', 20, '', 7);

INSERT INTO Author (id, book_id, name) VALUES
(1, 1, 'Ralph Johnson'),
(2, 2, 'Marie Aubinais'),
(3, 3, 'Thierry Courtin'),
(4, 4, 'Nathalie Bélineau'),
(5, 5, 'Marie-France Floury'),
(6, 6, 'Sophie Bellier');

INSERT INTO Category (id, book_id, name) VALUES
(1, 1, 'Computers'),
(2, 2, 'Creepy'),
(3, 3, 'Creepy'),
(4, 4, 'Creepy'),
(5, 5, 'Creepy'),
(6, 6, 'Creepy');
