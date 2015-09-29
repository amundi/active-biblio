Command line interface
======================

The CLI will be used to browse the library and perform every actions in a faster and more efficient way (no fantasy, only results).
Admins will be granted more privileges than the average registered user, that will himself be granted more power than anonymous users.

    alias cli='python3 biblio.py'

User
---------------

Functions available to users.    
All modifications require authentication and authorization.    
Read-only functions can be made anonymously.    

### Books

    - Return all books which match parameters   -->    cli book search [-t | -a | --isbn ...] parameters*    
    - Return details of specified book          -->    cli book details --id ID    
    - Create a new book                         -->    cli book create [-t | -a | --isbn ...] parameters*    
    - Create a new comment                      -->    cli book comment --id ID -c comment    
    - Mark the book as favorite                 -->    cli book star --id ID    
    - Unmark the book as favorite               -->    cli book unstar --id ID    
    - Like/+1 book                              -->    cli book like --id ID    
    - Cancel Like/+1 book                       -->    cli book dislike --id ID  
    - Is a book liked ?                         -->    cli book is-liked --id ID    
    - Rating a book                             -->    cli book rate --id ID    
    - Is a book rated ?                         -->    cli book is-rated --id ID    
    - Reserve the book                          -->    cli book reserve --id ID    
    - Cancel the reservation                    -->    cli book cancel-reservation --id ID -R Reservation    
    - Borrow the book                             -->    cli book rent --id ID    
    - Return the book                           -->    cli book return-book --id ID -R Reservation
    - Get hardcopies                            -->    cli book get-hardcopies --id ID    
    - Get comments                              -->    cli book get-comments --id ID    
    

### Hardcopies

    - Create a new hardcopy                     -->    cli hardcopy create    
    - Get hardcopy by id                        -->    cli hardcopy get --id ID    
    - Return hardcopies that match parameters   -->    cli hardcopy search [-t | -a | --isbn ...] parameters*    

### Accounts

    - Return current borrows                    -->    cli account borrows --id 0000000001    
    - Return finished borrows                   -->    cli account history --id 0000000001    
    - Return books added by user                -->    cli account user-books --id 0000000001    
    - Return reservations                       -->    cli account reservations --id 0000000001    
    - Return favorites                          -->    cli account favorites --id 0000000001    



Admin
---------------

Functions available to admins only.    

### Books

    - Update a book                             -->    cli book update-book --id ID      
    - Delete comment                            -->    cli book delete-comment --id ID --CI 123456789   
    - Add an author                             -->    cli book add-author --id ID -a [author(s)]     
    - Delete an author                          -->    cli book delete-author --id ID -a author     
    - Add a category                            -->    cli book add-category --id ID -c [category(ies)]     
    - Delete a category                         -->    cli book delete-category --id ID -c category     

### Hardcopies

    - Delete a hardcopy                         -->    cli hardcopy delete --id ID    
    - Update a hardcopy                         -->    cli hardcopy updated --id ID    

### Accounts

    - Return all accounts                       -->    cli account get    
    - Lock user account                         -->    cli account lock --id ID    
    - Unlock user account                       -->    cli account unlock --id ID    
    - Add location                              -->    cli account add-location -Lb building -Lf floor -Lr room    
    - Delete location                           -->    cli account delete-location --id ID    
    - Get all locations                         -->    cli account get-locations    
    