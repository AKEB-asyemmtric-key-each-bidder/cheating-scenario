const AKEB = artifacts.require("AKEB.sol");

contract("AKEB", (accounts) => {
  const auctioneer = accounts[0];
  const seller = accounts[1];
  const bidder1 = accounts[2];
  const bid1 = 11;
  const nonce1 = "bid1";
  const hash1 =
    "0x5647b2fc56179a52d9885e3188a4624e65f45772d1dc4ce067b8380d04a39977";

  const bidder2 = accounts[3];
  const bid2 = 22;
  const nonce2 = "bid2";
  const hash2 =
    "0x50c3208089b13dbbf91f80db31299cf2b996a7d2e671b5f49c6d513a89f63df1";

  const bidder3 = accounts[4];
  const bid3 = 33;
  const nonce3 = "bid3";
  const hash3 =
    "0xcec60b8bf0259b4ebd98f5b55fd70f78622e0623b1fff9f4e88c4cedcdbc0f5f";

  let auctionAddress;

  before("before all", async () => {
    console.log(`Auctioneer: ${auctioneer}`);
    console.log(`Seller: ${seller}`);
    console.log(`Bidder 1- address: ${bidder1}, bid:${bid1}, nonce:${nonce1}`);
    console.log(`Bidder 2- address: ${bidder2}, bid:${bid2}, nonce:${nonce2}`);
    console.log(`Bidder 3- address: ${bidder3}, bid:${bid3}, nonce:${nonce3}`);
    const auction = await AKEB.new();
    console.log("Auction smart contract is created");
    auctionAddress = auction.address;
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

  it("Register bidders", async () => {
    const auction = await AKEB.at(auctionAddress);
    await auction.registerBidder({ from: bidder1 });
    await auction.registerBidder({ from: bidder2 });
    await auction.registerBidder({ from: bidder3 });
    console.log("bidder 1,2,3 registered into smart contract");

    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");
    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");
    await fetch("http://127.0.0.1.:8000/increment-number-of-bidders/");

    console.log("bidder 1,2,3 registered into off-chain code");

    const participant1 = await auction.bidders(0);
    const participant2 = await auction.bidders(1);
    const participant3 = await auction.bidders(2);

    assert(bidder1 == participant1);
    assert(bidder2 == participant2);
    assert(bidder3 == participant3);
  });

  it("submit encoded bid into smart-contract and off-chain code", async () => {
    const auction = await AKEB.at(auctionAddress);

    await auction.submitEncodedBid(hash1, { from: bidder1 });
    await auction.submitEncodedBid(hash2, { from: bidder2 });
    await auction.submitEncodedBid(hash3, { from: bidder3 });

    console.log("bidders 1,2,3 submitted encoded bid into blockchain");

    const headers = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bid1 }),
    });
    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bid2 }),
    });
    await fetch("http://127.0.0.1.:8000/submit-bid/", {
      ...headers,
      body: JSON.stringify({ bid: bid3 }),
    });

    console.log("Bidders 1,2,3 sent their bids into off-chain code");

    const hash1FromSM = await auction.encodedBids(bidder1);
    const hash2FromSM = await auction.encodedBids(bidder2);
    const hash3FromSM = await auction.encodedBids(bidder3);

    assert(
      hash1 == hash1FromSM,
      "hash1 is not correctly submitted into Smart contract"
    );
    assert(
      hash2 == hash2FromSM,
      "hash2 is not correctly submitted into Smart contract"
    );
    assert(
      hash3 == hash3FromSM,
      "hash3 is not correctly submitted into Smart contract"
    );
  });

  it("off-chain computation evaluation", async () => {});
});
