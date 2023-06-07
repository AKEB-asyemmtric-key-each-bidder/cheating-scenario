const AKEB = artifacts.require("AKEB.sol");

contract("AKEB", (accounts) => {
  const auctioneer = accounts[0];
  const seller = accounts[1];
  const bidder1 = {
    name: "bidder1",
    address: accounts[2],
    bid: 11,
    nonce: "bid1",
    hash: "0x5647b2fc56179a52d9885e3188a4624e65f45772d1dc4ce067b8380d04a39977",
  };

  const bidder2 = {
    name: "bidder2",
    address: accounts[3],
    bid: 22,
    nonce: "bid2",
    hash: "0x50c3208089b13dbbf91f80db31299cf2b996a7d2e671b5f49c6d513a89f63df1",
  };

  const bidder3 = {
    name: "bidder3",
    address: accounts[4],
    bid: 33,
    nonce: "bid3",
    hash: "0xcec60b8bf0259b4ebd98f5b55fd70f78622e0623b1fff9f4e88c4cedcdbc0f5f",
  };

  let auctionAddress;

  before("before all", async () => {
    const auction = await AKEB.new();
    auctionAddress = auction.address;

    console.log(`Auctioneer: ${auctioneer}`);
    console.log(`Seller: ${seller}`);
    console.log({ bidder1 });
    console.log({ bidder2 });
    console.log({ bidder3 });
    console.log("Auction smart contract is created");
    console.log(
      `Auction smart contract address in your local machine:${auctionAddress}`
    );
  });

  it("Registering Asset info", async () => {
    const auction = await AKEB.at(auctionAddress);
    await auction.registerAuctionInfo("Watch", "Great watch", { from: seller });

    console.log(`Seller registers Asset information into smart contract`);
    console.log(`Asset name:Watch - Asset description: Great watch`);

    const assetName = await auction.assetName();
    const assetDesc = await auction.assetDescription();
    const sellerAddressInSM = await auction.seller();

    assert(assetName === "Watch");
    assert(assetDesc === "Great watch");
    assert(seller === sellerAddressInSM);
  });

  it("Registering bidders", async () => {
    const auction = await AKEB.at(auctionAddress);
    await auction.registerBidder({ from: bidder1.address });
    await auction.registerBidder({ from: bidder2.address });
    await auction.registerBidder({ from: bidder3.address });

    console.log("bidder 1,2,3 registered into smart contract");

    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");
    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");
    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");

    console.log("bidder 1,2,3 registered into off-chain code");

    const participant1 = await auction.bidders(0);
    const participant2 = await auction.bidders(1);
    const participant3 = await auction.bidders(2);

    assert(bidder1.address == participant1);
    assert(bidder2.address == participant2);
    assert(bidder3.address == participant3);
  });

  it("submitting encoded bid into smart-contract and off-chain code", async () => {
    const auction = await AKEB.at(auctionAddress);

    await auction.submitEncodedBid(bidder1.hash, { from: bidder1.address });
    await auction.submitEncodedBid(bidder2.hash, { from: bidder2.address });
    await auction.submitEncodedBid(bidder3.hash, { from: bidder3.address });

    console.log("bidders 1,2,3 submitted encoded bid into blockchain");

    const headers = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bidder1.bid }),
    });
    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bidder2.bid }),
    });
    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bidder3.bid }),
    });

    console.log("Bidders 1,2,3 sent their bids into off-chain code");

    const hash1FromSM = await auction.encodedBids(bidder1.address);
    const hash2FromSM = await auction.encodedBids(bidder2.address);
    const hash3FromSM = await auction.encodedBids(bidder3.address);

    assert(bidder1.hash == hash1FromSM);
    assert(bidder2.hash == hash2FromSM);
    assert(bidder3.hash == hash3FromSM);
  });

  it("Off-chain computation evaluation by bidder1", async () => {
    const auction = await AKEB.at(auctionAddress);

    // Off-chain validation by Bidder 1
    let winnerBid = await getWinnerBidFromOffChainCode();

    console.log(`the winner bid calculated by off-chain code is ${winnerBid}`);
    await compareWinnerBidWithBidderValue(winnerBid, bidder1, auction);
  });

  it("Off-chain computation evaluation by bidder2", async () => {
    const auction = await AKEB.at(auctionAddress);

    winnerBid = await getWinnerBidFromOffChainCode();
    await compareWinnerBidWithBidderValue(winnerBid, bidder2, auction);

    let currentWinner = await auction.winners(0);
    assert(bidder2.address === currentWinner.winnerAddress);
  });

  it("Off-chain computation evaluation by bidder3", async () => {
    const auction = await AKEB.at(auctionAddress);

    winnerBid = await getWinnerBidFromOffChainCode();
    await compareWinnerBidWithBidderValue(winnerBid, bidder3, auction);

    currentWinner = await auction.winners(0);
    assert(bidder3.address === currentWinner.winnerAddress);
  });

  async function compareWinnerBidWithBidderValue(winnerBid, bidder, auction) {
    // Dispute case
    if (bidder.bid > winnerBid) {
      console.log(`${bidder.name} is in Dispute case`);
      await auction.dispute(bidder.bid, bidder.nonce, { from: bidder.address });
      console.log(`Dispute request of ${bidder.name} is valid`);
      console.log(`Winner is changed to ${bidder.name}`);
    }
    // Winner case
    else if (bidder.bid === winnerBid) {
      console.log(`${bidder.name} is in Winner case`);
      await auction.submitWinner(bidder.bid, bidder.nonce, {
        from: bidder.address,
      });
      console.log(`Winner is changed to ${bidder.name}`);
    }
    // Neutral case
    else {
      console.log(`${bidder.name} is in Neutral case`);
      return;
    }
  }

  async function getWinnerBidFromOffChainCode() {
    const res = await fetch("http://127.0.0.1.:8000/get-winner/");
    const data = await res.json();
    return JSON.parse(data).winner;
  }
});
