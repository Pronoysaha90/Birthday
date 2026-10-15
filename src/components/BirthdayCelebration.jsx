import { Sparkles, Stars } from '@react-three/drei'
import { Cam } from '../lib/shared'
import { Fireworks, ShootingStars, FloatingHearts } from './Effects'
import { LOW } from '../lib/device'

export default function BirthdayCelebration() {
  return (<>
    <Cam pos={[0, 1, 9]} />
    <color attach="background" args={['#070418']} />
    <ambientLight intensity={0.6} /><pointLight position={[0, 4, 4]} intensity={60} color="#ffc4e6" />
    <Stars radius={60} depth={40} count={LOW ? 1500 : 3500} factor={3} fade speed={2} />
    <Fireworks rate={LOW ? 0.7 : 0.45} /><ShootingStars /><FloatingHearts count={LOW ? 8 : 14} />
    <Sparkles count={LOW ? 80 : 200} scale={[14, 8, 6]} size={5} speed={0.8} color="#ffe2a8" />
  </>)
}
