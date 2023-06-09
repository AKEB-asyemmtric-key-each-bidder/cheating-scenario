# AKEB Scenarios

This is a test script for demonstrating how the system works in `cheating` and `non-cheating` scenarios.

There are 3 bidders participating with the values below:

```javaScript
bidder1 = (11,"bid1")
bidder2 = (22,"bid2")
bidder3 = (33,"bid3")
```

## How to run the scenarios

Running scenarios are pretty straight-forward. All you need to have is to install (if you already don't have) `Docker` => [download-link](https://docs.docker.com/get-docker/).

1. Open docker desktop application.
2. Clone this repository into your system.

```git
git clone https://github.com/AKEB-asyemmtric-key-each-bidder/scenarios.git
```

3. Open the terminal (MacOS and Ubuntu) or powerShell (windows) and head into the directory of the project.
4. While you are in the directory of the project, run the command below.

```docker
docker compose build
```

5. The command above generates two images: one is image for off-chain code and another one is an image for smart-contract and front-end.

<img width="1258" alt="Screenshot 2023-06-09 at 6 50 36 AM" src="https://github.com/AKEB-asyemmtric-key-each-bidder/scenarios/assets/32008442/e304d430-5de5-4884-afcf-a3fc934f6f79">

6. Run the command below to execute the scenarios.

```docker
docker compose up
```

After running this command, you will see in the terminal that two scenarios (`cheating` and `non-cheating`) and the corresponding test cases are being executed. You can also observe the logs of the activities such as address of bidders, seller, auctioneer, smart contract address in the system.

![Screenshot 2023-06-09 at 6 57 31 AM](https://github.com/AKEB-asyemmtric-key-each-bidder/scenarios/assets/32008442/1050813a-5a65-4e55-9d1a-9061ba6bdc13)
![Screenshot 2023-06-09 at 7 01 15 AM](https://github.com/AKEB-asyemmtric-key-each-bidder/scenarios/assets/32008442/1b8f32e8-974c-4c3d-8e0d-6348c3e1498c)

