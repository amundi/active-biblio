REST API
========

Connection   
-------------   

- POST /login -> Check logs for a user and return a token   


User
---------------

Functions available to users.
All modifications require authentication and authorization.
Looking for a book/hardcopy and comments can be made anonymously.

### Books

A "Book" represents the *concept* of a book, not a physical book.
Think of it as a Book class in Java.

- GET /books?parameters -> Returns all books which match parameters (title, isbn, author, category, ...)
- GET /books/:id -> Returns details of specified book
- GET /books/:id/hardcopiesAvailable -> Returns hardcopies available for this book
- POST /books -> Create a new book
- GET /books/:id/comments -> Returns comments of specified book
- POST /books/:id/comments -> Create a new comment
- POST /books/:id/favorite -> Mark the book as favorite
- DELETE /books/:id/favorite -> Unmark the book as favorite
- GET /books/:id/favorite -> Returns if a book has been starred or not by the user
- POST /books/:id/like -> Like book
- DELETE /books/:id/like> Delete like for a book
- GET /books/:id/like -> Returns if a book has been liked or not by the user
- PUT /books/:id/rate -> Rating a book
- GET /books/:id/rate -> Returns if a book has been rated (and mark) or not by the user
- POST /books/:id/reservations -> Reserve the book
- DELETE /books/:id/reservations -> Cancel the reservation
- POST /books/:id/rentals -> Rent the book
- PUT /books/:id/rentals/ -> Returns the book

### Hardcopies

A "Hardcopy" represents a physical book.
Think of it as an instance of the Book class in Java.

- POST /hardcopies -> Create a new hardcopy
- GET /hardcopies?parameters -> Returns all hardcopies which match parameters (title , isbn, author, category, ...)   
- GET /harcopies/:id -> Returns details of specified hardcopy   

### Users  

- GET /users/rentals -> Returns current rentals
- GET /users/history/rentals -> Returns rentals finished
- GET /users/hardcopies -> Returns hardcopies added by the user
- GET /users/reservations -> Returns reservations
- GET /users/favorites -> Returns favorites from an account   

### Locations  

- GET /locations -> Return locations


Admin
---------------

Functions available to admins only.

### Admin

- GET /admin/accounts -> Returns all accounts
- PUT /admin/accounts/:id/lock -> Lock user account
- PUT /admin/accounts/:id/unlock -> Unlock user account  
- PUT /admin/accounts/:id/upgrade -> Upgrade an account from user to admin 
 
### Books

- PUT /books/:id -> Update a book
- DELETE /books/:id/comments/:comment_id -> Delete comment
- POST /books/:id/addAuthor -> Add an author for a book
- POST /books/:id/addCategory -> Add a category for a book
- DELETE /books/:id/deleteAuthor/:author_name -> Delete an author for a book
- DELETE /books/:id/deleteCategory/:category_name -> Delete a category for a book

### Hardcopies

- PUT /hardcopies/:id -> Update a hardcopy
- DELETE /hardcopies/:id -> Delete a hardcopy

### Locations  

- POST /location -> Create a location   
- DELETE /location/:id -> Delete a location  
