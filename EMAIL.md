Short explainer:

Email is a historically grown service. Nowadays we generally send complex MIME encapsulated mails with HTML content as the main body.
But there are a number of constraints because between the big silos (Google, Outlook, Apple) and small ISPs, plus different Mail clients
(Webmail, desktop clients like Outlook, Thunderbird, mobile clients) they all handle e.g. images and signatures a bit different.

Signatures are generally just something that is appended to an email.

Images in HTML generally reference the image file, usually on an external server, but many email systems do not show them by default, as accessing
such resources would allow the sender to track the email recipient. Exceptions: Google and Apple that use a sophisticated Proxy architecture that decouples
the access to the images from reading the email.

So there exists an option to embed images as the "location" (url) information in HTML directly. Problem solved. Not so fast. Our Webmail provider has a limit of roughly 80KB
for the HTML that we can upload for the signature block. So this signature block will compress any images you upload to this limit by default to create a signature block that fits
this limit. (And yes it priotizes your Photo, then our logo, and all the other images.)

Last but least, if your Mail client allows to edit your signature with a Rich-Text HTML editor (and not upload a HTML file) you probably are looking for the "view/edit source" button
in the styling options, so you can see the HTML "code" directly, delete what is there and then paste what this generator has generated.

So to summarize it has the following capabilities:

Default: ksuite webmail mode: generate a HTML signature block up to 80KB

Change the signature size: if you have a different mail client that needs different sizes or can handle bigger signatures

Spezial cases/odd cases: you know what you are doing -> use remote URLs. That will allow you to generate a signature block that uses remote urls -> these will look not nice by default in
most cases.
