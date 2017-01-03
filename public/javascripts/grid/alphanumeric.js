function generateRandomAlphas(index) {
  var alphabets ={1:'A',2:'B', 3:'C', 4:'D', 5:'E', 6:'F', 7:'G', 8:'H', 9:'I', 10:'J',11:'K',12:'L',13:'M',14:'N',15:'O',16:'P',17:'Q',18:'R', 19:'S',20:'T',21:'U',22:'V',23:'W',24:'X',25:'Y',26:'Z'};
  var i = 0, modOf26, substract, val = '';
  i = index+1;
  while (i > 0) {
    if (i <= 26) {
      modOf26 = i;
      val = alphabets[modOf26] + val; i = 0;
    } else {
      modOf26 = i % 26;
      subtract = (modOf26 == 0) ? 26 : modOf26;
      i = (i - subtract) / 26;
      val=alphabets[subtract]+val;
    }
  }
  return val;
}

