import CodeExplaineForm from './forms/CodeExplaineForm'
import Header from './Header'

const CodeEntry = () => {
    return (
        <div className="min-h-screen flex flex-col items-center p-6">
            <Header />
            <CodeExplaineForm />
        </div>
    )
}

export default CodeEntry