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
                <p>Hi <%= username %>,</p>
                <p>This mail is regarding to the password change activity from the user</p>
                <p>Kindly, click the below link to change the password accordingly!</p>
                <p><a href="<%= redirecturl %>?id=<%= userid %>?type=<%= userType %>&apn=com.qway_mobile">Reset Password</a> to your reset password.</p>
            </div>
        </div>
    </div>
</body>

</html>`