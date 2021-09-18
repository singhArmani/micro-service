## Microservice Pattern with Eureka Service Discovery and Zuul (load balancer). 


### Microservices
- Hero service
- Threat service


### Service Discovery 
- Eureka service (service discovery Jar file )

### Load Balancer 
- Zuul (Jar file)


### Persistence Layer
- MongoDB Atlas Cluster 



### Running the project
- Run service discovery: 
```sh
java -jar eureka-service-0.0.1-SNAPSHOT.jar
```

- Run Zuul service
```sh
java -jar zuul-0.0.1-SNAPSHOT.jar --server.port=9090 --eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/
```

- Run hero-service v2 (which user persistence layer)
```sh
  node heroes-v2/heroes.js 3000
```

- Run threat-service v2
 ```sh
  node threats-v2/threats.js 5000
 ```

 ### MongoDB
 - Connect to your MongoDB

 ### Tmux Yml file
  - Check `./micro.yml` file (tmux config) to run all the services inside tmux panels.
