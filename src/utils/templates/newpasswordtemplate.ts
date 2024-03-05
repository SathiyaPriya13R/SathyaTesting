export default `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>

<body>
    <div>
        <div>
            <div>
                <p>Hello <b> <%= username %>,</p>
                <p>Welcome to ORCA CRED,<br /> You have been assigned an user id and password to access ORCACRED.</p>
                <p>Your login user name  is <%= username %>. You can login using your email id too. And your login password is <b> <%= password %> </p>
                <p>Kindly, Please click the below link  to login! </p>
                <p>href="<%= redirecturl %>"to login</p>
            </div>
        </div>
    </div>
</body>

</html>`