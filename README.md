Active Biblio
=============

Active Biblio is a simple system to manage a small collection of books:

- Tracking: who has a book, since when, reserved until when
- Waiting lists: reserve a book to be the next to borrow it
- Easy way to borrow books
- Easy way to register new books
- Search and browse the collection
- Social features: like, recommend, share a book

The main building blocks:

- [Backend service](service), built with Node.js
- [Web interface](WebClient), built with AngularJS: search, browse, track, social
- [Terminal app](terminal), built with Ionic: badge scanner, barcode scanner
- [Command line interface](CLI), built with Python

For more details, see the specs in [docs/specs/subsystems.md](docs/specs/subsystems.md)

How to contribute
-----------------

Need ideas how to help?

- Look at the list of issues for inspiration
- Install locally and test. The project is young with many obvious opportunities to improve

If you want to work on a listed issue,
assign it to yourself, or leave a message to avoid others doing double work.

If you want to work on something not listed,
add it to the list (create issue), and assign it to yourself.

When the feature is ready, creaet a Merge/Pull Request. Thank you!!!

How to install locally
----------------------

See the README files in the subsystems. A few quick tips:

- [Backend service](service): as an alternative to running locally,
  another option is to connect the other components to a live demo.
  *Unfortunately the unit tests are broken at the moment.*
  
- [Web interface](WebClient): easiest to run locally from WebStorm.
  Can be configured to use a local backend or a live demo.
  *Probably the easiest part of the system to improve at the moment.*
  
- [Terminal app](terminal): easiest to run locally from WebStorm.
  Can be configured to use a local backend or a live demo.
  To test the barcode scanner, you'll need a portable device.
  The barcode scanner is known to not work with some devices
  (unable to recognize a barcode when pointing at it).
  The badge scanner part is not implemented yet at all,
  Hacene is working on it.

- [Command line interface](CLI): 
  Can be configured to use a local backend or a live demo.
  *Probably broken at the moment, some work on authentication with the server is needed.*

Each subsystem should have an example config file with `.example` extension.
Rename that file and customize.
Ideally the example config file should work in a local install out of the box.
(If that's not the case, that's a bug to be fixed.)

See also the GitLab / GitHub Wiki for additional resources, such as
configuration files used by the live demos, sample data, and others.
