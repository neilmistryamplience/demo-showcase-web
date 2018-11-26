pipeline {
	agent {
      label "jnlp-slave-docker"
    }

	stages {
		stage('Install') {
			steps {
                usingECR {
                    insideImage('amplience/node-build-tools:8.10') {
                        sh 'npm install'
                        sh 'npm run build'
                        sh 'export SLS_DEBUG=true && ./node_modules/serverless/bin/serverless --help' // to ensure it is installed
                    }
                }
			}
		}

		stage('Dev') {
			steps {
			    usingECR {
                    insideImage('amplience/node-build-tools:8.10') {
                        ansiColor('xterm') {
                            withAWS(credentials: 'aws-dev-jenkins-user-type', region: 'eu-west-1') {
                                sh 'export SLS_DEBUG=true && ./node_modules/serverless/bin/serverless deploy --stage dev --verbose'
                            }
                        }
                    }
                }
			}
		}


	 	stage('Production') {
			when {
			   branch 'master'
			}
			steps {
			    usingECR {
                  insideImage('amplience/node-build-tools:8.10') {
                    ansiColor('xterm') {
                        withAWS(credentials: 'aws-dev-jenkins-user-type', region: 'eu-west-1') {
                            sh 'export SLS_DEBUG=true && ./node_modules/serverless/bin/serverless deploy --stage production --verbose'
                        }
                    }
                  }
                }
			}
		}

		/*stage('Teardown') {
			steps {
			    usingECR {
                    insideImage('amplience/node-build-tools:8.10') {
                        withAWS(credentials: 'aws-dev-jenkins-user-type', region: 'eu-west-1') {
                            echo 'No need for DEV environment now, tear it down'
                            sh 'export SLS_DEBUG=true && ./node_modules/serverless/bin/serverless remove --stage dev --verbose'
                        }
                    }
                }
			}
		}*/
	 }

}

	 void usingECR(String url = "https://395026163603.dkr.ecr.eu-west-1.amazonaws.com",
                   String credentials = "ecr:eu-west-1:aws-dev-jenkins",
                   Closure<?> body) {
       docker.withRegistry(url, credentials, body)
     }

     void insideImage(String imageName, Closure<?> body) {
       def image = docker.image(imageName)
       image.pull()
       image.inside() {
         body()
       }
     }