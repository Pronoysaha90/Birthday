import { Component } from 'react'
export default class ErrorBoundary extends Component {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  render() {
    return this.state.err
      ? <div className="fixed inset-0 grid place-items-center text-center p-6"><p>3D graphics aren't available on this device. Try a recent browser with WebGL enabled.</p></div>
      : this.props.children
  }
}
