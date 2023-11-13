# Project Title
McWorking

## 1. Project Description
Our team is developing "McWorking" to inform everyone of which McDonalds have broken ice cream machines before visiting by checking our site.

## 2. Names and Roles of Contributors 
* Simon Lotzkar - Developer, Manager, Designer
	
## 3. Technologies and Resources Used
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)

## 4. Complete setup/installion/usage
The app is ready straight away for viewing, but to submit data users must sign up for an account. This can be done from any page on the website either from the navbar, or a prompt on the page.

## 5. Known Bugs and Limitations
Here are some known bugs:
* ...

## 6. Features for Future
* Expanding from just icecream machines to all products (eg. chicken nuggets)
* Expanding to other businesses (eg. TimHortons)
	
## 7. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── catalog.html             # restaurant browser page
├── eachRestaurant.html      # individual restaurant page
├── index.html               # landing page
├── profile.html             # user profile page
└── README.md
└── signUp.html              # signs up user with firebase auth
├── submitRestaurant.html    # page for adding new restaurants to database
├── template.html            # template for making pages

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for image files
    /icecream-bw.png             # icecream logo (black and white)
    /icecream-green.png          # icecream logo (green)
    /icecream-red.png            # icecream logo (red)
├── scripts                  # Folder for java script files
    /catalog.js                  # runs catalog page
    /eachRestauarant.js          # runs restaurant page
    /firebaseAPI_TEAM17.js       # connects to firebase API
    /login.js                    # logs in user to firebase auth
    /profile.js                  # runs profile page
    /script.js                   # general functions used by multiple pages
    /signUp.js                   # runs sign up page
    /skeleton.js                 # loads content on all pages (footer, header, etc)
    /submitRestaurant.js         # runs submit restaurant page
├── styles                   # Folder for cascading style sheet files
    /style.css                   # styles all pages
├── text                     # Folder for insertable html files
    /footer.html                 # footer information
    /navAfterLogin.html          # navigation bar (after login)
    /navBeforeLogin.html         # navigation bar (after login)
    /updateAfterLogin.html       # allows update submission
    /updateBeforeLogin.html      # prompts for login/signup
```

## 7. Contents of Database
Content of the firestore database:

```
├── restaurants              # [collection] mcdonalds restaurant locations
    /ID                          
        .location                # [geopoint] lat and long coordinates
        .city                    # [string] name of location's city
        .dateUpdated             # [timestamp] last time an update was submitted
        .postalCode              # [string] name of location's postal code
        .status                  # [boolean] status of ice cream machine
        .address                 # [string] street number and name of location
        /updates                 # [subcollection] icecream machine status updates
            /ID
                .dateSubmitted       # [timestamp] when the update was submitted
                .upvotes             # [number] indicates a user thought the update was accurate
                .downvotes           # [number] indicates a user thought the update was inaccurate
                .status              # [boolean] status of icecream machine
                .userID              # [string] update owner's user id
                .upvoterIDList       # [string array] list of users' IDs that upvoted on the update
                .downvoterIDList     # [string array] list of users' IDs that downvoted on the update
├── users                    # [collection] user profiles
    /ID
        .dateSignUp              # [timestamp] when user signed-up
        .dateLogIn               # [timestamp] when user last logged-in
        .username                # [string] display name of user
        /refUpdates              # [subcollection] points to an update the user submitted
            /ID
                .date                # [timestamp] when the update was submitted (this is needed for easy sequential ordering on profile page)
                .restaurantID        # [string] restaurant id where update was submitted
                .updateID            # [string] update's id
```