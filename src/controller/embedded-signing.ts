export default `<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Embedded Signing</title>
    <style>
        html,
        body {
            padding: 0;
            margin: 0;
            font-family: Arial, sans-serif;
        }

        #docusign-container {
            width: 100%;
            height: 800px;
        }
    </style>
</head>

<body>
    <div id="docusign-container"></div>

    <script src="https://js-d.docusign.com/bundle.js"></script>
    <script>
        window.onload = function () {
            window.DocuSign.loadDocuSign('<%= integrationKey %>')
                .then((docusign) => {
                    const signing = docusign.signing({
                        url: '<%= signingUrl %>',
                        displayFormat: 'embedded',
                        style: {
                            /** Custom styles here */
                            // Example:
                            // primaryButton: {
                            //     backgroundColor: '#333',
                            //     color: '#fff',
                            // },
                            // signingNavigationButton: {
                            //     finishText: 'Complete signing',
                            //     position: 'bottom-center',
                            // },
                        }
                    });

                    signing.on('ready', (event) => {
                        console.log('UI is rendered');
                    });

                    signing.on('sessionEnd', (event) => {
                        console.log('Session ended:', event);
                    });

                    signing.mount('#docusign-container');
                })
                .catch((ex) => {
                    console.error('Error loading DocuSign:', ex);
                });
        };
    </script>
</body>

</html>`