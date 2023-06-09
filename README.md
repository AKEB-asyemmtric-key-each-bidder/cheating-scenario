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

![docker-images](<Screenshot 2023-06-09 at 6.50.36 AM.png>)
