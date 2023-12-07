# McWorking

## 1. Project Description
We are developing "McWorking" to allow McDonalds patrons to check the status of any location's icecream machine before visiting.

## 2. Project Team: BBY17
* Simon Lotzkar: Designer, Developer, Planner
* Yongseong Choi: Designer
* Jacob Ardelean: Designer
	
## 3. Technologies and Resources Used
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)

## 4. Complete setup/installion/usage
The app is ready straight away for viewing, but to submit data users must sign up for an account. This can be done from any page using the website's navbar.

## 5. Bugs and Limitations
Here are some known bugs and limitations:
* [Limitation] After changing customization, the page reloads instead of dynamically updating.
* [Limitation] Read quantity is very high, causes site to crash while testing. Will be issue when useage is medium-high.
    * => refactor collection listeners and make as few as possible
* [Bug] User update count is glitchy when deleting updates on profile page.
    
## 5. Future Plans
Expansions (large multi-feature additions) and features that can be made after launching the app:
* [Expansion] Allow users to submit an update for any product instead of just icecream (eg. smoothies)
* [Expansion] Add other restaurants to the catalog (eg. TimHortons)
* Restaurant Page
    * [PageFeature] Add a report form to each restaurant to allow users to flag admins for incorrect locations (eg we added the wrong address)
    * [PageFeature] Add filter to catalog for filtering by status
    * [PageFeature] Include google map links for restaurants
* Catalog Page
    * [PageFeature] Add MapBox display at top of page that has user's location as a pin and all locations currently shown as pins
* Profile Page
    * [PageFeature] Add a preview 'dummy update' of what the user's posts will look like on their profile page
* NEW Pages
    * [Page] Add a submission form for users to request a missing restaurant to be added
    * [Page] Customization manager page accessible to admins only (allow for editing, deleting, and creating customizations)
    * [Page] Restaurant manager page to replace submit restaurant page (allow for editing and creating restaurants)
* Authentication
    * [AuthFeature] Add google sign-up/log-in
* [Feature] Add % of users that have unlocked achievement
* [Feature] Have an image stored for each restaurant and load as card image instead of single repeated one
* [Feature] Add countdown timer below submit update button that displays remaining timeout time
* [Feature] Add loading bar to places where restaurants and updates are loaded
	
## 6. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── about.html               # info page on app and authors
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
    ...TODO
├── scripts                  # Folder for java script files
    /catalog.js                  # runs catalog page
    /eachRestauarant.js          # runs restaurant page
    /firebaseAPI_TEAM17.js       # connects to firebase API
    /index.js                    # runs index (home) page
    /login.js                    # logs in user to firebase auth
    /profile.js                  # runs profile page
    /script.js                   # general functions used by multiple pages
    /signUp.js                   # runs sign up page
    /skeleton.js                 # loads content on all pages (footer, header, etc)
    /submitRestaurant.js         # runs submit restaurant page
├── styles                   # Folder for cascading style sheet files
    /about.css                   # styles about page
    /catalog.css                 # styles catalog page
    /eachRestaurant.css          # styles restaurant page
    /index.css                   # styles home page
    /nav.css                     # styles navbar
    /profile.css                 # styles profile page
    /restaurantCard.css          # styles restaurant cards
    /signUp.css                  # styles sign up page
    /style.css                   # styles all pages
    /submitRestaurant.css        # styles submission page
    /template.css                # used for making css files
├── text                     # Folder for insertable html files
    /footer.html                 # footer information
    /navAfterLogin.html          # navigation bar (after login)
    /navBeforeLogin.html         # navigation bar (after login)
    /restaurantCardTemplate.html # template for generating restaurant cards
```

## 7. Contents of Database
Content of the firestore database:

```
├── restaurants              # [collection] mcdonalds restaurant locations
    /ID                          
        .location                # [geopoint] lat and long coordinates
        .city                    # [string] name of location's city
        .postalCode              # [string] name of location's postal code
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
        .username                # [string] display name of user
        .avatar                  # [reference] points to the avatar the user has chosen
        .banner                  # [reference] points to the banner the user has chosen
        .achievements            # [reference array] each reference points to an achievement the user has unlocked
        .admin                   # [boolean] gives access to submit restaurant page and allows the user to delete anyone's updates
        /refUpdates              # [subcollection] points to an update the user submitted
            /ID
                .date                # [timestamp] when the update was submitted (this is needed for easy sequential ordering on profile page)
                .restaurantID        # [string] restaurant id where update was submitted
                .updateID            # [string] update's id
├── customizations           # [collection] profile customizations
    /ID
        .name                    # [string] name of the customization
        .type                    # [string] type of the customization (one of: avatar, banner, achievement)
        .imageURL                # [string] name of image in url
        .description             # [string] description of the customization
```