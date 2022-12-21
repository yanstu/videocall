$.fn.extend({
  //---元素拖动插件
  dragging: function (data) {
    var $this = $(this);
    var xPage;
    var yPage;
    var X; //
    var Y; //
    var father = $this.parent();
    var defaults = {
      move: 'both',
      randomPosition: true,
      hander: 1,
    };
    var opt = $.extend({}, defaults, data);
    var movePosition = opt.move;
    var random = opt.randomPosition;

    var hander = opt.hander;

    if (hander == 1) {
      hander = $this;
    } else {
      hander = $this.find(opt.hander);
    }

    //---初始化
    $this.css({ position: 'absolute' });
    hander.css({ cursor: 'move' });

    const faWidth = $('body').innerWidth();
    const faHeight = $('body').innerHeight();
    let thisWidth = $this.innerWidth();
    let thisHeight = $this.innerHeight();

    let mDown = false; // 
    let positionX;
    let positionY;
    let moveX;
    let moveY;

    if (random) {
      $thisRandom();
    }

    function $thisRandom() {
      //随机函数
      $this.each(function (index) {
        const randY = parseInt(Math.random() * (faHeight - thisHeight)); ///
        const randX = parseInt(Math.random() * (faWidth - thisWidth)); ///
        if (movePosition.toLowerCase() == 'x') {
          $(this).css({
            left: randX,
          });
        } else if (movePosition.toLowerCase() == 'y') {
          $(this).css({
            top: randY,
          });
        } else if (movePosition.toLowerCase() == 'both') {
          $(this).css({
            top: randY,
            left: randX,
          });
        }
      });
    }

    hander.mousedown(function (e) {
      father.children().css({ zIndex: '0' });
      $this.css({ zIndex: '1' });
      mDown = true;
      X = e.pageX;
      Y = e.pageY;
      positionX = $this.position().left;
      positionY = $this.position().top;
      return false;
    });

    $(document).mouseup(function (e) {
      mDown = false;
    });

    $(document).mousemove(function (e) {
      thisWidth = $this.innerWidth();
      thisHeight = $this.innerHeight();

      xPage = e.pageX; //--
      moveX = positionX + xPage - X;

      yPage = e.pageY; //--
      moveY = positionY + yPage - Y;

      function thisXMove() {
        //x轴移动
        if (mDown == true) {
          $this.css({ left: moveX });
        } else {
          return;
        }
        if (moveX < 0) {
          $this.css({ left: '0' });
        }
        if (moveX > faWidth - thisWidth) {
          $this.css({ left: faWidth - thisWidth });
        }
        return moveX;
      }

      function thisYMove() {
        //y轴移动
        if (mDown == true) {
          $this.css({ top: moveY });
        } else {
          return;
        }
        if (moveY < 0) {
          $this.css({ top: '0' });
        }
        if (moveY > faHeight - thisHeight) {
          $this.css({ top: faHeight - thisHeight });
        }
        return moveY;
      }

      function thisAllMove() {
        //全部移动
        if (mDown == true) {
          $this.css({ left: moveX, top: moveY });
        } else {
          return;
        }
        if (moveX < 0) {
          $this.css({ left: '0' });
        }
        if (moveX > faWidth - thisWidth) {
          $this.css({ left: faWidth - thisWidth });
        }

        if (moveY < 0) {
          $this.css({ top: '0' });
        }
        if (moveY > faHeight - thisHeight) {
          $this.css({ top: faHeight - thisHeight });
        }
      }

      if (movePosition.toLowerCase() == 'x') {
        thisXMove();
      } else if (movePosition.toLowerCase() == 'y') {
        thisYMove();
      } else if (movePosition.toLowerCase() == 'both') {
        thisAllMove();
      }
    });
  },
});
