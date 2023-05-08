//SPDX-License-Identifier: Unlicense

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract cytoWave721 is ERC721{

   struct Art {
       uint256 id;
       string title;
       string description;
       uint256 price;
       string date;
       string authorName;
       address payable author;
       address payable owner;  
       uint status;  
       string image;
    }
   struct ArtTxn {
       uint256 id;
       uint256 price;
       address seller;
       address buyer;
       uint txnDate;
       uint status;
    }

   // gets updated during minting(creation), buying and reselling
   uint256 private pendingArtCount;
   mapping(uint256 => ArtTxn[]) private artTxns;
   uint256 public index;  // uint256 value; is cheaper than uint256 value = 0;.
   Art[] public arts;

   // log events back to the user interface
   event LogArtSold(uint _tokenId, string _title, string _authorName, uint256 _price,   address _author,  address _current_owner, address _buyer);

   event LogArtTokenCreate(uint _tokenId, string _title, string _category, string _authorName, uint256 _price, address _author,  address _current_owner);

   event LogArtResell(uint _tokenId, uint _status, uint256 _price);


   constructor (string memory name, string memory symbol) ERC721(name, symbol){}

   /* Create or minting the token */
   function createToken(string memory _title, string memory _description,string memory _date, string memory _authorName, 
   uint256 _price, string memory _image) public {

       require(bytes(_title).length > 0, 'The title cannot be empty');
       require(bytes(_date).length > 0, 'The Date cannot be empty');
       require(bytes(_description).length > 0, 'The description cannot be empty');
       require(_price > 0, 'The price cannot be empty');
       require(bytes(_image).length > 0, 'The image cannot be empty');

       Art memory _art = Art({
           id: index,
           title: _title,
           description: _description,
           price: _price,
           date: _date,
           authorName: _authorName,
           author: payable(msg.sender),
           owner: payable(msg.sender),
           status: 1,
           image: _image
       });

       arts.push(_art);   // push to the array

        // array length -1 to get the token ID = 0, 1,2 ...
      uint256 tokenId = arts.length -1 ;
       _safeMint(msg.sender, tokenId);
       emit LogArtTokenCreate(tokenId,_title,  _date, _authorName,_price, msg.sender, msg.sender);

       index++;
       pendingArtCount++;
    }

    function buyArt(uint256 _tokenId) payable public {
       (uint256 _id, string memory _title, ,uint256 _price, uint _status, , string memory _authorName, address _author,address payable _current_owner,) =  findArt(_tokenId);
       require(_current_owner != address(0));
       require(msg.sender != address(0));
       require(msg.sender != _current_owner);
       require(_status == 1, "Art is not for sale");
       require(msg.value >= _price);
       require(arts[_tokenId].owner != address(0));
       // transfer ownership of the art
       _safeTransfer(_current_owner, msg.sender, _tokenId, "");
       //return extra payment
       if(msg.value > _price) payable(msg.sender).transfer(msg.value - _price);
       //make a payment to the current owner
       _current_owner.transfer(_price);

       arts[_tokenId].owner = payable(msg.sender);
       arts[_tokenId].status = 0;
  
       ArtTxn memory _artTxn = ArtTxn({
           id: _id,
           price: _price,
           seller: _current_owner,
           buyer: msg.sender,
           txnDate: block.timestamp,
           status: _status
       });

       artTxns[_id].push(_artTxn);
       pendingArtCount--;
       emit LogArtSold(_tokenId,_title,  _authorName,_price, _author,_current_owner,msg.sender);
   }

    /* Pass the token ID and get the art Information */
   function findArt(uint256 _tokenId) public view returns (
       uint256, string memory, string memory, uint256, uint status,  string memory, string memory, address, address payable, string memory) 
    {
     Art memory art = arts[_tokenId];
     return (art.id, art.title, art.description,art.price, art.status, art.date, art.authorName,art.author, art.owner,art.image); 
    }

    function resellArt(uint256 _tokenId, uint256 _price) public {
        require(_price >= 0, "Price must be equal to or greater than zero");
        // require(ownerOf(_tokenId) == msg.sender, "Only the owner can resell the NFT");
        require(msg.sender != address(0));
        require(isOwnerOf(_tokenId,msg.sender));
        
        if (_price == 0) {
            // Remove the NFT from sale by setting the status to 0
            arts[_tokenId].status = 0;
        } else {
            // List the NFT for sale by setting the status to 1 and updating the price
            arts[_tokenId].status = 1;
            arts[_tokenId].price = _price;
            pendingArtCount++;
        }

        emit LogArtResell(_tokenId, arts[_tokenId].status, _price);
    }


   /* returns all the pending arts (status =1) back to the user */
   function findAllPendingArt() public view  returns (uint256[] memory, address[] memory, address[] memory,  uint[] memory) {
     if (pendingArtCount == 0) {
          return (new uint256[](0),new address[](0), new address[](0), new uint[](0)); 
       }
  
       uint256 arrLength = arts.length;
       uint256[] memory ids = new uint256[](pendingArtCount);
       address[] memory authors = new address[](pendingArtCount);
       address[] memory owners= new address[](pendingArtCount);
       uint[] memory status = new uint[](pendingArtCount);
       uint256 idx = 0;
       for (uint i = 0; i < arrLength; ++i) {
           Art memory art = arts[i];
           if(art.status==1) {
                   ids[idx] = art.id;
                   authors[idx] = art.author;
                   owners[idx] = art.owner;
                   status[idx] = art.status;
                   idx++;
               }
           }

       return (ids,authors, owners, status); 
   }

   function findMyArts()  public view returns (uint256[] memory _myArts) {
       require(msg.sender != address(0));
       uint256 numOftokens = balanceOf(msg.sender);
       if (numOftokens == 0) {
           return new uint256[](0);
       }
       else{
           uint256[] memory myArts = new uint256[](numOftokens);
           uint256 idx = 0;
           uint256 arrLength = arts.length;
           for (uint256 i = 0; i < arrLength; i++) {
               if (ownerOf(i) == msg.sender) {
                   myArts[idx] = i;
                   idx++;
               }
           }
           return myArts;
       }
   }

   function isOwnerOf(uint256 tokenId, address account) public view returns (bool) {
       address owner = ownerOf(tokenId);
       require(owner != address(0));
       return owner == account;
   }


   function get_symbol() external view returns (string memory)
   {
       return symbol();
   }

   function get_name() external view returns (string memory)
   {
       return name();
   }
    // get number of art in the art array
    function getArtCount() public view returns (uint256) {
        return arts.length - 1;
    }


}

contract cytoWave1155 is ERC1155, Ownable {
    uint256 private _currentTokenId = 0;

    struct Art {
        uint256 id;
        string title;
        string description;
        uint256 price;
        string date;
        string authorName;
        address payable author;
        string image;
    }

    mapping(uint256 => Art) private artData;
    mapping(uint256 => address) public creators;
    Art[] public arts;
   // log events back to the user interface
    event LogArtTokenCreate(uint256 tokenId, string title, string date, string authorName, uint256 price, address author);
    event ArtPurchased(uint256 tokenId, string title, string authorName, uint256 price, address author, address newOwner);
    event LogArtResell(uint256 tokenId, string title, string authorName, uint256 price, address author, address newOwner);

    constructor(string memory uri) ERC1155(uri) {}

    function createToken(
        string memory title,
        string memory description,
        uint256 price,
        string memory date,
        string memory authorName,
        string memory image,
        bool isFungible,
        uint256 initialSupply
    ) public onlyOwner returns (uint256) {
        uint256 newTokenId = _currentTokenId++;
        if (isFungible) {
            _mint(msg.sender, newTokenId, initialSupply, "");
        } else {
            _mint(msg.sender, newTokenId, 1, "");
        }
        creators[newTokenId] = msg.sender;

        artData[newTokenId] = Art({
            id: newTokenId,
            title: title,
            description: description,
            price: price,
            date: date,
            authorName: authorName,
            author: payable(msg.sender),
            image: image
        });


        emit LogArtTokenCreate(newTokenId, title, date, authorName, price, msg.sender);

        return newTokenId;
    }

    function buyArt(uint256 tokenId) public payable {
        require(artData[tokenId].author != address(0), "Art does not exist");
        require(msg.value >= artData[tokenId].price, "Insufficient payment");
        require(balanceOf(creators[tokenId], tokenId) > 0, "Art is not available for sale");

        address seller = creators[tokenId];
        safeTransferFrom(seller, msg.sender, tokenId, 1, "");

        if (msg.value > artData[tokenId].price) {
            payable(msg.sender).transfer(msg.value - artData[tokenId].price);
        }

        payable(seller).transfer(artData[tokenId].price);

        emit ArtPurchased(tokenId, artData[tokenId].title, artData[tokenId].authorName, artData[tokenId].price, seller, msg.sender);
    }

    function findArt(uint256 tokenId) public view returns (
        uint256, string memory, string memory, uint256, string memory, string memory, address, string memory
    ) {
        Art memory art = artData[tokenId];
        return (
            art.id,
            art.title,
            art.description,
            art.price,
            art.date,
            art.authorName,
            art.author,
            art.image
        );
    }
    function getArtCount() public view returns (uint256) {
        return arts.length - 1;
    }


    function resellArt(uint256 tokenId, uint256 newPrice) public {
    require(artData[tokenId].author != address(0), "Art does not exist");
    require(balanceOf(msg.sender, tokenId) > 0, "Caller is not the owner of the art");
    require(newPrice > 0, "New price must be greater than zero");

    // Update the art price
    artData[tokenId].price = newPrice;

    // Emit the LogArtResell event
    emit LogArtResell(
        tokenId,
        artData[tokenId].title,
        artData[tokenId].authorName,
        newPrice,
        artData[tokenId].author,
        msg.sender
    );
}

}


contract cytoWave {
    cytoWave721 public art721;
    cytoWave1155 public art1155;

    constructor(address _art721, address _art1155) {
        art721 = cytoWave721(_art721);
        art1155 = cytoWave1155(_art1155);
    }

}
