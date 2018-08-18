import Color from './color'
import basic from './basic'

import { merge } from '@benzed/immutable'

/******************************************************************************/
// Data
/******************************************************************************/

export default merge(basic, {

  brand: {
    primary: new Color('blue'),
    secondary: new Color('cyan'),
    success: new Color('green'),
    warn: new Color('yellow'),
    danger: new Color('red')
  }

})
