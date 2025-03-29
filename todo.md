- [x] database
- [x] next auth
- [x] login
- [x] register
- [x] dashboard
- [x] account settings
- [x] live
- [x] location view

--- 0.2.0 LIVE

- [x] location setter
- [x] location only visible to fellowship members
- [x] streams
- [] stream thumbnail
- [x] api/live/set => say permission
- [x] SettingsChange - boolean
- [x] leaders manage move
- [x] account/roles

--- 0.3.0 PERMISSIONS

- [x] admin => routes
- [x] admin/elders => roles
- [] verified members by elders
- [] verified members only access to fcc and zoom for /live
- [x] add/remove[] routes
- [x] add/remove[x] permited rooutes on roles
- [x] add/remove[] roles
- [x] add/remove[x] users permited on roles

--- 0.4.0 PHOTOS

- [x] API
- [x] image fetch from server
- [x] albums
- [x] single album
- [x] photos slider
- [x] single photo download
- [x] album download
- [x] #bug access to cors for photo download
- [x] #bug album with one image disappears on scroll
- [x] api/album hide/unhide
- api/album rename, date
- [x] api/photo hide/unhide
- [x] single photo overlay download, share
- [x] multi image select, dowload, hide/unhide
- [x] previlages, only custom changeble roles access "photos_manage"
- [x] album view count
- [x] set thumbnail
- [] request remove

- [x] #optimazation PhotoGallery using next/image
- [] #optimization on server downscaling
- [x] #optimization on server thumbnailing
- [x] #optimization load more images before view
- [x] #optimization generic image download very slow

- [x] /api album view count
- [] /api image view count (sperate table augmented views)
- [] /api image download count
- [] ftp file upload with server folder creation and trigger thumbnailing
- [] image upload server that optimizes
- [] Page title snd description on album
- [] header sticky

ux feedback

- [x] Gallery order by date
- [x] Close gallery doesn't cause redirection
- [x] Download button on the right
- [x] Load images before view
- [] Add background loading
- [x] Call "downloading" "preparing"
- [x] openGraph

--- PRE LAUNCH

- [x] image optimization
- [x] feedback
- [x] antd css preload

- [x] photo optimization
- [x] email reset
- [] new members onboarding
- [x] prayer requests basic

--- 0.5.0 REGISTRATION

- [x] trcp
- [] email verification
- [x] password reset link
- [x] welcome form
- [x] replace /photos next/Image to native img
- [x] /photos set image as profile photo
- [x] /photos select all
- [x] /photos float button to top
- [] /permissions rename routes (manage routes page)
- [] Emails
  - [] on new feedback to elders
  - [x] on new prayer request
  - [x] on prayer assignment
  - [] on new user
  - [] on new wicf member
  - [] add prayer request #id to email, remoe data
- [x] general registration link redirect link
- [] new members registration flag
  - [] old registration link
  - [x] new registration link
  - [] new members management page
    - [] export by month
    - [] assign new member for followup
  - [] login by email
- [] remove extra data from use session on wicf_membership 
- [] account add properties to modify
- [] log page for properties change
- [x] log dumps for membership data changes
- [x] flag when registration complete when done
- [x] export graph
- [x] total members
- [] new members (tabs)
- [] search data

REGISTRATION BUGS
  - [x] /welcome redirects to contact even when number is valid then goes to login after
  - [x] /login giving error "Failed to fetch user data" even when successful from line 411
  - [x] /welcome calls even if no change
  - [x] /my_stay not going to /school on mobile

-- NOTIFICATIONS
- [] dedicated page
- [x] db and mechanism
- [] /bug undefined started registration


-- STATS
- [x] calculate starts
- [x] get starts
- [] trigger on 5 increment
- [] dedicated page

-- PRAYER MINISTRY CHANGES
- [] /prayer user list (only leaders and prayer team). userSearch filter by role
- [] prayer email, dont forward, just alert
  - [] have prayers assigned to me page

-- 0.6.0 FORM BUILDER

- [] Create form
- [] Edit form
- [] Form permisions (formAdmins, formCreate)
- [] Prayer requests
- [] Suggestion Box
- [] Survey
- [] Log
  - [] logins
  - [] account changes
  - [] wicf membership
  - [] leaders page
  - [] user @createdOn

-- 0.7.0 DBS

- []

-- 0.8.0 SERVICE PREPARATION

- [] SERMON SUBMISSION (SERMON PREVIEW FOR USER AFTER)
- [] WORSHIP MUSIC SUBMISSION
- [] ASSIGNMENTS
- [] AUTOMATED SUNDAY SCHEDULE
- [] INHOUSE MESSAGING

#NB

- inforce points and separate sermon/presenttion notes
- preview of presentation
- changable background
- creation of themes determines fields
- show both main, streming, vertical

--- /LIVE/SOCKETS

- [] registration
- [] trpc
- [] sockets
- [] sockets => live/participants
- [] sockets => view count
- [] live/notice

  ---- /NEW MEMBERS

- [] email magic link (forget password)
- [] registration for new members

---- /PRAYER

- [x] prayer request
- [] prayer - { [x] name/anony - [] tick box , need follow up - [] concent to congregation intervation}
- [] mark as read, new request barge
- [x] email on new prayer request
- [x] email on prayer assignment
- [x] prayer assignment

---- /EVANGELISM
Evangelism notes - on new member signup

- wechat id not required
- remove "Would you like to commit/rededicate your life to Christ?"
- have you accepted christ -if no => would you like to know more
- on need prayer yes => prayer request on reg
- sunday people count

--- /FINACE
- budget request
- income / expenditure recording
- monthly report

---- BUGS

- [x] fix wicf_member with no data keeps loading
- [x] /dashboard/live media members not allowed to make live
- [] auth expires quickly
- [] uploadThings => image change
- [] layout reference => https://shop.churchmotiongraphics.com/
- [x] #bug error on user creation when no basic role

--- BUGS: 2024.06.06 - Dependency update

- [] photos progress load not showing
- [x] text color on dashboard for not logged in is black
- [x] Sidebar text black

---- OPTIMIZATION

- [] emotion/css ssr
- [] antd/css ssr

---- DOMAIN

- [] domain => wuhanicf.com =>

--- PORTFOLIO

- [] Custom profile image upload
- [] Automatic elders page creation

--- POST TOOLS
Tool that allows upload of templates and then allows minimal modification
for (quotes, thumbnails, flyers) canva like

-- ASSET MANAGENT

- list of all assets, ministry, number, estimate, cost
- budgets and checks if exists
- formal budget template

-- AUTO REPORTS

- who was involved
- speakers invited
- challenges
-
